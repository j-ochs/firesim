import { FiresimPage } from './app.po';

describe('firesim App', () => {
  let page: FiresimPage;

  beforeEach(() => {
    page = new FiresimPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
