module.exports = [
    {
        title: 'My App',
        filename: 'index.html',
        template: 'src/html/layouts/layout.pug',
        inject: 'body',
        minify: false,
        env: {
            page: 'page.pug'
        },
        chunks: ['index']
    }
]