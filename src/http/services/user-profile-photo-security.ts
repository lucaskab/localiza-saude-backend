import { randomUUID } from "node:crypto";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

const MAX_PROFILE_PHOTO_SIZE = 4 * 1024 * 1024;

const allowedPhotoTypes = {
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
	"image/webp": {
		extension: "webp",
		matches: (buffer: Buffer) =>
			buffer.length > 12 &&
			buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
			buffer.subarray(8, 12).toString("ascii") === "WEBP",
	},
} as const;

type AllowedPhotoMimeType = keyof typeof allowedPhotoTypes;

function isAllowedPhotoMimeType(
	mimeType: string,
): mimeType is AllowedPhotoMimeType {
	return mimeType in allowedPhotoTypes;
}

function hasSuspiciousTextPayload(buffer: Buffer) {
	const prefix = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("utf8");

	return /<script|<\?php|javascript:/i.test(prefix);
}

export function validateUserProfilePhotoFile(params: {
	buffer: Buffer;
	mimeType: string;
}) {
	const { buffer, mimeType } = params;

	if (buffer.length === 0) {
		throw new BadRequestError("Profile photo file is empty");
	}

	if (buffer.length > MAX_PROFILE_PHOTO_SIZE) {
		throw new BadRequestError("Profile photo exceeds the 4MB limit");
	}

	if (!isAllowedPhotoMimeType(mimeType)) {
		throw new BadRequestError("Unsupported profile photo file type");
	}

	const fileType = allowedPhotoTypes[mimeType];

	if (!fileType.matches(buffer)) {
		throw new BadRequestError("Profile photo content does not match its type");
	}

	if (hasSuspiciousTextPayload(buffer)) {
		throw new BadRequestError("Profile photo content is not allowed");
	}

	return {
		storageFileName: `${randomUUID()}.${fileType.extension}`,
		size: buffer.length,
		mimeType,
	};
}
