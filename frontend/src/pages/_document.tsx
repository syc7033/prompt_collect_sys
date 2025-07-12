import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="zh-CN" dir="ltr">
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          {/* 添加额外的meta标签确保正确渲染中文 */}
          <meta httpEquiv="Content-Language" content="zh-CN" />
          <meta name="description" content="AI提示词知识库 - 收集和分享高质量AI提示词" />
          {/* 添加全局样式标签 */}
          <style dangerouslySetInnerHTML={{ __html: `
            html, body {
              direction: ltr !important;
              writing-mode: horizontal-tb !important;
              text-orientation: mixed !important;
            }
          `}} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
