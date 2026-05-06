import { S3Client } from "bun";
import { env } from "../../env";

export interface UploadFileParams {
	file: File;
	folder?: string;
	fileName?: string;
}

export interface UploadFileResult {
	key: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
}

export class StorageService {
	private s3Client: S3Client;
	private publicUrl: string;

	constructor() {
		this.s3Client = new S3Client({
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			bucket: env.R2_BUCKET_NAME,
			endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		});

		this.publicUrl = env.R2_PUBLIC_URL;
	}

	async uploadFile({
		file,
		folder = "messages",
		fileName,
	}: UploadFileParams): Promise<UploadFileResult> {
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const sanitizedFileName = (fileName ?? file.name).replace(
			/[^a-zA-Z0-9.-]/g,
			"_",
		);
		const key = `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`;

		await this.s3Client.write(key, file, {
			type: file.type,
		});

		return {
			key,
			fileName: file.name,
			fileSize: file.size,
			mimeType: file.type,
		};
	}

	async deleteFile(key: string): Promise<void> {
		await this.s3Client.delete(key);
	}

	presignUrl(key: string, expiresIn = 3600): string {
		return this.s3Client.file(this.normalizeStoredKey(key)).presign({
			expiresIn,
		});
	}

	extractKeyFromUrl(url: string): string | null {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			return pathname.startsWith("/") ? pathname.substring(1) : pathname;
		} catch {
			return null;
		}
	}

	normalizeStoredKey(value: string): string {
		if (!value.startsWith("http")) {
			return value;
		}

		const extractedKey = this.extractKeyFromUrl(value);
		if (!extractedKey) {
			return value;
		}

		const bucketPrefix = `${env.R2_BUCKET_NAME}/`;
		return extractedKey.startsWith(bucketPrefix)
			? extractedKey.slice(bucketPrefix.length)
			: extractedKey;
	}
}

export const storageService = new StorageService();
