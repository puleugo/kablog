import {Posts} from "../domain/posts.js";
import {PostEntity} from "../domain/postEntity.js";
import {XMLParser} from "fast-xml-parser";
import {HrefTagEnum, RssResponse} from "../type.js";
import {BlogEntity} from "../domain/blog.entity.js";
import {githubActionLogger, LoggerInterface} from "../util/logger/github-action.logger";

export interface RssRepositoryInterface {
	readNewPosts(blog: BlogEntity): Promise<Posts>;
}

export class RssRepository implements RssRepositoryInterface {
	private readonly xmlParser = new XMLParser();
	constructor(private readonly logger: LoggerInterface) {
	}

	async readNewPosts(blog: BlogEntity): Promise<Posts> {
		this.logger.debug(`블로그 ${blog.title}(${blog.platform})의 새로운 포스트를 확인합니다.`);
		const rssRaw = await fetch(blog.rssUrl);
		const body = await rssRaw.text();
		const jsonResult = this.xmlParser.parse(body);
		const rss = jsonResult.rss;

		const posts = this.parsingTistoryRss(rss, blog.lastPublishedIndex+1)
		posts.blog = blog;
		const newPost = posts.filterNewPosts(blog.lastPublishedAt);
		this.logger.debug(`새로운 포스트 ${newPost.length}개를 찾았습니다.`);
		return newPost;
	}


	private parsingTistoryRss(raw: RssResponse, startIndex: number): Posts {
		this.logger.debug('티스토리 RSS를 파싱합니다.');
		const rawPosts = raw.channel.item.sort((a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime());
		return new Posts(rawPosts.map(post => {
				const result = new PostEntity({
					title: post.title,
					content: post.description,
					uploadedAt: post.pubDate,
					hasUploadedOnGithub: false,
					originUrl: post.guid,
					language: HrefTagEnum.Korean,
				}, startIndex);
				startIndex++;
				return result
			}
		));
	}
}

export const rssRepository = new RssRepository(githubActionLogger);
