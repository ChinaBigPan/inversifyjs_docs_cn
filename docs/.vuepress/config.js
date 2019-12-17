module.exports = {
	title: "InversifyJS 中文文档",
	description: "",
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
			permalink: false
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
		"vuepress-plugin-smooth-scroll",
		"@vuepress/medium-zoom",
		[
			"redirect",
			{
				// 提供多语言重定向功能
				// 它会自动从 `/foo/bar/` 定向到 `/:locale/foo/bar/`，如果对应的页面存在
				locales: true,
				storage: true // 保存最后一次访问的结果到 `localStorage`，供下次重定向使用
			}
		]
	],
	themeConfig: {
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
			}
		],
		lastUpdated: "上次更新",
		repo: ""
	},
	head: [["link", { rel: "icon", href: "/images/favicon.ico" }]]
};
