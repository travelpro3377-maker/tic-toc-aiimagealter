import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* TikTok site verification meta tag */}
          <meta name="tiktok-developers-site-verification" content="FuYAi6L4BbAshSzuYBT1xSKJ1ga0AiUd" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
