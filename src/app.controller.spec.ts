import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppController } from './app.controller.js';

const dataFilePath = join(process.cwd(), 'src', 'article-views.json');
let originalData: string;

beforeEach(() => {
  originalData = readFileSync(dataFilePath, 'utf8');
});

afterEach(() => {
  writeFileSync(dataFilePath, originalData, 'utf8');
});

describe('AppController', () => {
  it('lists articles alphabetically by default', () => {
    const result = new AppController().getArticleViews();
    const titles = result.articleViews.map((articleView) => articleView.title);

    expect(
      titles.every(
        (title, index) =>
          index === 0 || titles[index - 1].localeCompare(title, 'hu') <= 0,
      ),
    ).toBe(true);
  });

  it('supports sorting the homepage by views in descending order', () => {
    const result = new AppController().getArticleViews('views', 'desc');
    const views = result.articleViews.map((articleView) => articleView.views);

    expect(views).toEqual([...views].sort((a, b) => b - a));
  });

  it('filters by the minimum views and sorts results descending', () => {
    const result = new AppController().getFilteredArticleViews('1000');
    const views = result.articleViews.map((articleView) => articleView.views);

    expect(views.every((viewCount) => viewCount >= 1000)).toBe(true);
    expect(views).toEqual([...views].sort((a, b) => b - a));
  });

  it('keeps invalid form values and does not save them', () => {
    const controller = new AppController();
    const originalCount = controller.getArticleViews().articleViews.length;
    const result = controller.createArticleView({
      title: 'New article',
      url: 'http://example.com',
      views: '10',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('https://');
    expect(result.formData).toEqual({
      title: 'New article',
      url: 'http://example.com',
      views: '10',
    });
    expect(controller.getArticleViews().articleViews).toHaveLength(originalCount);
  });

  it('saves a valid article to the JSON file', () => {
    const result = new AppController().createArticleView({
      title: 'New article',
      url: 'https://example.com/article',
      views: '0',
    });
    const savedData = JSON.parse(readFileSync(dataFilePath, 'utf8')) as Array<{
      title: string;
      url: string;
      views: number;
    }>;

    expect(result.success).toBe(true);
    expect(savedData.at(-1)).toEqual({
      title: 'New article',
      url: 'https://example.com/article',
      views: 0,
    });
  });
});
