import { S3Client } from "bun";
import { env } from "../../env";

export interface UploadFileParams {
	file: File;
	folder?: string;
}

export interface UploadFileResult {
	url: string;
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
	}: UploadFileParams): Promise<UploadFileResult> {
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
		const key = `${folder}/${timestamp}-${randomString}-${sanitizedFileName}`;

		await this.s3Client.write(key, file, {
			type: file.type,
		});

		// Use presigned URL with 7 days expiration (604800 seconds)
		const url = this.presignUrl(key, 604800);

		return {
			url,
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
		return this.s3Client.file(key).presign({
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
}

export const storageService = new StorageService();
