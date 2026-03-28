import { Deferred } from '../utils/deferred.js';

function ElmRect(el) {
	if (el == null) return null;

	var rect = el.getBoundingClientRect();
	this.left = rect.left + window.pageXOffset;
	this.top = rect.top + window.pageYOffset;
	this.width = el.offsetWidth;
	this.height = el.offsetHeight;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;

	this.union = function(r) {
		if (r.left < this.left) this.left = r.left;
		if (r.right > this.right) this.right = r.right;
		if (r.top < this.top) this.top = r.top;
		if (r.bottom > this.bottom) this.bottom = r.bottom;
		this.width = this.right - this.left;
		this.height = this.bottom - this.top;
	};
}

var WinletJSEngine = {
	ImgBg: new Image(1, 1),
	ImgLoading: new Image(1, 1),
	ImgValidating: new Image(1, 1),

	topSpace: 0,
	bottomSpace: 0,
	leftSpace: 0,
	rightSpace: 0,

	widCounter: 0,
	isStatic: false,
	isApme: false,
	detectHashChange: true,

	reEscape: /(:|\.|\[|\])/g,
	reScriptAll: new RegExp('<script.*?>(?:\n|\r|.)*?<\/script>', 'img'),
	reScriptOne: new RegExp('<script(.*?)>((?:\n|\r|.)*?)<\/script>', 'im'),
	reScriptLanguage: new RegExp('.*?language.*?=.*?"(.*?)"', 'im'),
	reScriptSrc: new RegExp('.*?src.*?=.*?"(.*?)"', 'im'),
	reScriptType: new RegExp('.*?type.*?=.*?"(.*?)"', 'im'),
	reScriptCharset: new RegExp('.*?charset.*?=.*?"(.*?)"', 'im'),
	reCSSAll: new RegExp('<link.*?type="text/css".*?>', 'img'),
	reCSSHref: new RegExp('.*?href="(.*?)"', 'im'),
	reWinWinlet: new RegExp('win\\$\\.winlet\\s*\\(', 'img'),
	reWinContainer: new RegExp('win\\$\\.container\\s*\\(', 'img'),
	reWinPost: new RegExp('win\\$\\.post\\s*\\(', 'img'),
	reWinPostEmpty: new RegExp('win\\$\\.post\\s*\\(\\s*\\)', 'img'),
	reWinEmbed: new RegExp('win\\$\\.embed\\s*\\(', 'img'),
	reWinInclude: new RegExp('win\\$\\.include\\s*\\(', 'img'),
	reWinAjax: new RegExp('win\\$\\.ajax\\s*\\(', 'img'),
	reWinGet: new RegExp('win\\$\\.get\\s*\\(', 'img'),
	reWinToggle: new RegExp('win\\$\\.toggle\\s*\\(', 'img'),
	reWinUrl: new RegExp('win\\$\\.url\\s*\\(', 'img'),
	reWinSubmit: new RegExp('win\\$\\.submit\\s*\\(', 'img'),
	reWinFind: new RegExp('win\\$\\.find\\s*\\(', 'img'),
	reWinWait: new RegExp('win\\$\\.wait\\s*\\(', 'img'),
	reWinAfterSubmit: new RegExp('win\\$\\.aftersubmit\\s*\\(', 'img'),
	reWinlet: new RegExp('^\\s*(((/\\w+)?/.+/)\\w+)(\\?([^\\s]+))?(\\s+(.*?))?$'),
	reWinletParam: new RegExp('(\\w+)\\:(\\w+)'),
	reDialogSetting: new RegExp('<div id="winlet_dialog"[^>]*>(.*?)<\/div>', 'img'),
	reWinletHeader: new RegExp('<div id="winlet_header"[^>]*>(.*?)<\/div>', 'img'),
	reMetaTitle: new RegExp('<meta\\s+name\\s*=\\s*"\\s*title\\s*"\\s+content=\\s*"([^"]+)"[^>]*>'),
	reMeta: new RegExp('<meta\\s+(name|property)\\s*=\\s*"[^"]*"\\s+content=\\s*"[^"]+"[^>]*>'),
	reAction: new RegExp('^(.*)\\?_a=(.*)$'),

	winletRootMap: {},
	contextRootMap: {},
	hashGroupMap: {},

	useSessionStorage: null,

	winletId: 1,

	analyticHashChanged: function() {},
	analyticWindow: function() {},
	analyticAction: function() {},
	analyticValidate: function() {},

	// Dialog methods - will be overridden by modal.js
	getDialog: function(_container, _createIfNotExist) { return null; },
	openDialog: function(_container, _content, _title) {},
	closeDialog: function(_container) {
		var dfd = Deferred();
		dfd.resolve();
		return dfd.promise();
	}
};

export { WinletJSEngine, ElmRect };
