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
		'declaring_container_modules',
		'container_snapshots',
		'controlling_the_scope_of_the_dependencies'
	]
}

module.exports = {
	title: "InversifyJS 中文文档",
	description: "基于TypeScript的短小精干的JavaScript和Node.js控制反转(IoC)库",
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
