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
				link: "/"
			},
			{
			    text: "Github",
			    link: "https://github.com/inversify/InversifyJS/"
			}
		],
		sidebar: [
			{
			    title: "简介",
			    path: "/routes/",
			    sidebarDepth: 2
			},
			{
				title: '安装',
				path: '/routes/installation',
				sidebarDepth: 2
			},
			{
				title: '基础',
				path: '/routes/basics',
				sidebarDepth: 2
			},
			{
				title: '特性和API',
				path: '/routes/features_api',
				sidebarDepth: 0,
				children: [
					{
						title: '对类的支持',
						path: '/routes/wiki/support_for_classes.html',
					},
					{
						title: '对Symbol的支持',
						path: '/routes/wiki/support_for_Symbols.html',
					},
					{
						title: '容器API',
						path: '/routes/wiki/container_API.html'
					}				
				]
			}
		],
		lastUpdated: "上次更新",
		repo: ""
	},
	head: [["link", { rel: "icon", href: "/images/favicon.ico" }]]
};
