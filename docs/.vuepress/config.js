function getBasicSideBar() {
	return [
		'',
		'installation',
		'basics'
	]
}

function getWikiSideBar() {
	return [
		'support_for_classes',
		'support_for_Symbols',
		'container_api',
		'declaring_container_modules'
	]
}

module.exports = {
	title: "InversifyJS 中文文档",
	description: "A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript",
	configureWebpack: {
		resolve: {}
	},
	base: "/inversifyjs_docs_cn/",
	markdown: {
		lineNumbers: true
	},
	themeConfig: {
		activeHeaderLinks: true,
		displayAllHeaders: true, // 默认值：false
		smoothScroll: true,
		nav: [
			{
				text: "首页",
				link: "/routes/basic/"
			},
			{
				text: '特性和API',
				link: "/routes/wiki/"
			},
			{
			    text: "Github",
			    link: "https://github.com/inversify/InversifyJS/"
			}
		],
		sidebar: {
			'/routes/basic/': getBasicSideBar(),
			'/routes/wiki/': getWikiSideBar()
		},
		lastUpdated: "上次更新",
		repo: ""
	},
	head: [["link", { rel: "icon", href: "/images/favicon.ico" }]]
};
