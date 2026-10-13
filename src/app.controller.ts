import { Body, Controller, Get, Post, Query, Render } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CreateArticleViewDto } from './create-article-view.dto.js';
import { ArticleView } from './article-view.interface.js';

@Controller()
export class AppController {
  private readonly dataFilePath = join(
    process.cwd(),
    'src',
    'article-views.json',
  );
  private readonly articleViews = this.loadArticleViews();

  private loadArticleViews(): ArticleView[] {
    return JSON.parse(readFileSync(this.dataFilePath, 'utf8')) as ArticleView[];
  }

  private saveArticleViews(): void {
    writeFileSync(
      this.dataFilePath,
      `${JSON.stringify(this.articleViews, null, 2)}\n`,
      'utf8',
    );
  }

  @Get()
  @Render('index')
  getArticleViews(
    @Query('sort') sort?: string,
    @Query('direction') direction?: string,
  ) {
    const sortBy = sort === 'views' ? 'views' : 'title';
    const sortDirection = direction === 'desc' ? 'desc' : 'asc';
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    const articleViews = [...this.articleViews].sort((a, b) => {
      const comparison =
        sortBy === 'title'
          ? a.title.localeCompare(b.title, 'hu')
          : a.views - b.views;

      return comparison * multiplier;
    });

    return {
      pageTitle: 'Wikipedia-szócikkek',
      articleViews,
      sortBy,
      sortDirection,
    };
  }

  @Get('filter')
  @Render('filter')
  getFilteredArticleViews(@Query('minViews') minViews?: string) {
    const parsedMinViews = minViews === undefined ? 0 : Number(minViews);
    const threshold = Number.isFinite(parsedMinViews) ? parsedMinViews : 0;

    return {
      pageTitle: 'Szócikkek szűrése',
      minViews: minViews ?? '0',
      articleViews: [...this.articleViews]
        .filter((articleView) => articleView.views >= threshold)
        .sort((a, b) => b.views - a.views),
    };
  }

  @Get('new')
  @Render('new')
  getNewArticleViewForm() {
    return {
      pageTitle: 'Új szócikk felvétele',
      success: false,
      error: null,
      formData: { title: '', url: '', views: '' },
    };
  }

  @Post('new')
  @Render('new')
  createArticleView(@Body() dto: CreateArticleViewDto) {
    const title = typeof dto?.title === 'string' ? dto.title.trim() : '';
    const url = typeof dto?.url === 'string' ? dto.url.trim() : '';
    const rawViews = dto?.views;
    const viewsValue = typeof rawViews === 'string' ? rawViews.trim() : '';
    const views = Number(viewsValue);
    const formData = { title, url, views: viewsValue };

    let error: string | null = null;
    if (!title || !url || !viewsValue) {
      error = 'Mindhárom mező kitöltése kötelező.';
    } else if (!url.startsWith('https://')) {
      error = 'Az URL-nek https:// kezdetűnek kell lennie.';
    } else if (!Number.isFinite(views) || views < 0) {
      error = 'A megtekintések száma legalább 0 legyen.';
    }

    if (error) {
      return {
        pageTitle: 'Új szócikk felvétele',
        success: false,
        error,
        formData,
      };
    }

    this.articleViews.push({ title, url, views });
    this.saveArticleViews();

    return {
      pageTitle: 'Új szócikk felvétele',
      success: true,
      error: null,
      formData: { title: '', url: '', views: '' },
    };
  }
}
