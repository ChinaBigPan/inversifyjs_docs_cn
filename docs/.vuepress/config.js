function getBasicSideBar() {
	return [
		'',
		'installation',
		'basics',
		'thanks'
	]
}

function getWikiSideBar() {
	return [
		'',
		'support_for_classes',
		'support_for_Symbols',
		'container_api',
		'declaring_container_modules',
		'container_snapshots',
		'controlling_the_scope_of_the_dependencies',
		'optional_dependencies',
		'injecting_a_constant_or_dynamic_value',
		'injecting_a_class_constructor',
		'injecting_a_factory',
		'auto_factory',
		'injecting_a_provider',
		'activation_handler',
		'post_construct_decorator',
		'middleware',
		'multi-injection',
		'tagged_bindings',
		'create_your_own_tag_decorators',
		'named_bindings',
		'default_targets',
		'hierarchical_di',
		'contextual_bindings',
		'property_injection',
		'circular_dependencies',
		'inheritance'
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
		displayAllHeaders: false, // 默认值：false
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
				text: '生态系统',
				items: [
					{ text: '工具 utils', link: "/routes/ecosystem/utilities/utilities" },
					{ text: '中间件 middleware', link: '/routes/ecosystem/middleware/middleware' },
					{ text: '开发工具 devtools', link: '/routes/ecosystem/development-tools/development-tools' },
					{ text: '示例 examples', link: '/routes/ecosystem/examples/examples' }
				]
			},
			{
			    text: "Github",
			    link: "https://github.com/inversify/InversifyJS/"
			}
		],
		sidebar: {
			'/routes/basic/': getBasicSideBar(),
			'/routes/wiki/': getWikiSideBar(),
			'/routes/ecosystem/utilities/': [
				'utilities',
				'inversify-binding-decorators',
				'inversify-inject-decorators',
				'inversify-express-utils',
				'inversify-restify-utils',
				'inversify-vanillajs-helpers',
				'inversify-tracer',
				'inversify-components',
				'inversify-token',
				'inversify-socket-utils',
				'inversify-koa-utils'
			],
			'/routes/ecosystem/middleware/': [
				'middleware',
				'inversify-logger-middleware'	
			],
			'/routes/ecosystem/development-tools/': [
				'development-tools',
				'inversify-devtools',
				'inversify-chrome-devtools'
			],
			'/routes/ecosystem/examples/': [
				'examples',
				'Basic',
				'Express',
				'Hapi',
				'inversifyjs-binding-decorators'
			]
		},
		lastUpdated: "上次更新",
		repo: ""
	},
	head: [["link", { rel: "icon", href: "/images/favicon.ico" }]]
};
