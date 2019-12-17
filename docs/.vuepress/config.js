module.exports = {
	title: "InversifyJS 中文文档",
	description: "A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript",
	configureWebpack: {
		resolve: {
			alias: {
				"@img": "/inversifyjs_docs_cn/images/"
			}
		}
	},
	base: "/inversifyjs_docs_cn/",
	markdown: {
		lineNumbers: true,
		anchor: {
			permalink: true, 
			permalinkBefore: true, 
			permalinkSymbol: '#'
		},
		extendMarkdown: md => {
			// 使用更多的markdown-it插件
			md.use(require("markdown-it-anchor"));
		}
	},
	plugins: [
		"@vuepress/active-header-links",
		"@vuepress/back-to-top",
		"@vuepress/last-updated",
		"@vuepress/nprogress",
		"@vuepress/medium-zoom"
	],
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
				sidebarDepth: 2
			}
		],
		lastUpdated: "上次更新",
		repo: ""
	},
	head: [["link", { rel: "icon", href: "/images/favicon.ico" }]]
};
