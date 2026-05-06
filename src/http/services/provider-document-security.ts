import { createHash, randomUUID } from "node:crypto";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

const MAX_PROVIDER_DOCUMENT_SIZE = 5 * 1024 * 1024;

const allowedDocumentTypes = {
	"application/pdf": {
		extension: "pdf",
		matches: (buffer: Buffer) =>
			buffer.subarray(0, 5).equals(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d])),
	},
	"image/png": {
		extension: "png",
		matches: (buffer: Buffer) =>
			buffer
				.subarray(0, 8)
				.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
	},
	"image/jpeg": {
		extension: "jpg",
		matches: (buffer: Buffer) =>
			buffer.length > 3 &&
			buffer[0] === 0xff &&
			buffer[1] === 0xd8 &&
			buffer[2] === 0xff,
	},
} as const;

type AllowedDocumentMimeType = keyof typeof allowedDocumentTypes;

function isAllowedDocumentMimeType(
	mimeType: string,
): mimeType is AllowedDocumentMimeType {
	return mimeType in allowedDocumentTypes;
}

function sanitizeOriginalFileName(fileName: string) {
	const sanitizedFileName = fileName
		.replace(/[^\p{L}\p{N}._ -]/gu, "_")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 120);

	return sanitizedFileName || "professional-document";
}

function hasSuspiciousTextPayload(buffer: Buffer) {
	const prefix = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("utf8");

	return /<script|<\?php|javascript:/i.test(prefix);
}

export function validateProviderDocumentFile(params: {
	buffer: Buffer;
	fileName: string;
	mimeType: string;
}) {
	const { buffer, fileName, mimeType } = params;

	if (buffer.length === 0) {
		throw new BadRequestError("Document file is empty");
	}

	if (buffer.length > MAX_PROVIDER_DOCUMENT_SIZE) {
		throw new BadRequestError("Document file exceeds the 5MB limit");
	}

	if (!isAllowedDocumentMimeType(mimeType)) {
		throw new BadRequestError("Unsupported document file type");
	}

	const fileType = allowedDocumentTypes[mimeType];

	if (!fileType.matches(buffer)) {
		throw new BadRequestError("Document file content does not match its type");
	}

	if (hasSuspiciousTextPayload(buffer)) {
		throw new BadRequestError("Document file content is not allowed");
	}

	const sha256 = createHash("sha256").update(buffer).digest("hex");
	const safeOriginalFileName = sanitizeOriginalFileName(fileName);
	const storageFileName = `${randomUUID()}.${fileType.extension}`;

	return {
		sha256,
		safeOriginalFileName,
		storageFileName,
		size: buffer.length,
		mimeType,
	};
}

