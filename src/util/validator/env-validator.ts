import {githubActionLogger, LoggerInterface} from "../logger/github-action.logger";
import * as core from "@actions/core";

export interface EnvValidatorInterface {
	getOrThrow(key: string): string;
	getOrNull(key: string): string | null;
}

export class EnvValidator implements EnvValidatorInterface{
	constructor(private readonly logger: LoggerInterface) {}

	getOrThrow(key: string): string {
		this.logger.debug(`${key}를 가져옵니다.`);
		let value = process.env[key];
		if (!value) {
			this.logger.error(`${key}가 빈값입니다.`);
			throw new Error(`${key}가 빈값입니다.`);
		}
		return value.replace(new RegExp("\\\\n", "\g"), "\n"); // 구글 인증 키에서 줄바꿈 문자를 처리하기 위함
	}

	getOrNull(key: string): string | null {
		return process.env[key] ?? null;
	}

	putOrThrow(key: string, value: string) {
		this.logger.debug(`환경변수 ${key}에 ${value}를 저장합니다.`);
		if (!key) {
			this.logger.error('key가 필요합니다.');
			throw new Error('key가 필요합니다.');
		}
		if (!value) {
			this.logger.error(`${key}에 빈값을 저장할 수 없습니다.`);
			throw new Error(`${key}에 빈값을 저장할 수 없습니다.`);
		}
		process.env[key] = value;
	}
}

export const envValidator = new EnvValidator(githubActionLogger);
envValidator.putOrThrow('GH_REPOSITORY', core.getInput('GH_REPOSITORY'));
envValidator.putOrThrow('GH_TOKEN', core.getInput('GH_TOKEN'));
envValidator.putOrThrow('GH_USER', core.getInput('GH_USER'));
envValidator.putOrThrow('GOOGLE_SHEET_ID', core.getInput('GOOGLE_SHEET_ID'));
envValidator.putOrThrow('GOOGLE_CLIENT_EMAIL', core.getInput('GOOGLE_CLIENT_EMAIL'));
envValidator.putOrThrow('GOOGLE_PRIVATE_KEY', core.getInput('GOOGLE_PRIVATE_KEY'));
