import { createApp } from 'vue';

import App from './App.vue';
const app = createApp(App);

//导入路由配置
import router from './router';
app.use(router);

//导入SVG依赖库，可以在页面上显示SVG图片（此处为新增）
import 'virtual:svg-icons-register';

//引用ElementPlus的CSS文件，否则MacOS系统会出现控件丢失样式
import 'element-plus/dist/index.css';

//导入ElementUI的消息通知组件，后续定义Ajax函数中需要用到弹窗展现提示信息
import ElementPlus from 'element-plus';

//为了让日历控件每周从星期一开始，所以要导入简体中文场景
import locale from 'element-plus/lib/locale/lang/zh-CN';

//应用到VUE框架上
app.use(ElementPlus, {
	locale
});

//为了可以使用ElementPlus自带的图标库
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component);
}

//导入JQuery库，因为Ajax用起来非常方便，支持同步和异步的Ajax请求
import $ from 'jquery';

//导入ElementUI的消息通知组件，下面封装全局Ajax的时候处理异常的时候需要弹出通知
import { ElMessage } from 'element-plus';
//配置websocket
import VueNativeSock from 'vue-native-websocket-vue3';

import html2Canvas from 'html2canvas';
import jsPDF from 'jspdf';

function isSplit(nodes, index, pageHeight) {
	//计算当前这块dom是否跨越了a4大小，以此分割
	if (nodes[index].offsetTop + nodes[index].offsetHeight < pageHeight && nodes[index + 1] && nodes[index + 1].offsetTop + nodes[index + 1].offsetHeight > pageHeight) {
		return true;
	}
	return false;
}

app.config.globalProperties.getPdf = function () {
	var title = this.htmlTitle; //PDF 标题
	let ST = document.documentElement.scrollTop || document.body.scrollTop;
	let SL = document.documentElement.scrollLeft || document.body.scrollLeft;
	document.documentElement.scrollTop = 0;
	document.documentElement.scrollLeft = 0;
	document.body.scrollTop = 0;
	document.body.scrollLeft = 0;
	// 得到滚动条的位置 并赋值为0，因为是el-dialog弹框，并且内容较多出现了纵向的滚动条，截图出来的效果只能截取到视图窗口显示的部分
	//超出窗口部分则无法生成。so 先将滚动条置顶
	const A4_WIDTH = 592.28;
	const A4_HEIGHT = 841.89;
	let imageWrapper = document.querySelector('#pdfDom'); //获取DOM
	var title = imageWrapper?.getAttribute('name'); //pdf 标题
	let pageHeight = (imageWrapper?.scrollWidth / A4_WIDTH) * A4_HEIGHT;
	let labelListID = imageWrapper?.querySelector('p');
	//分割操作 当DOM内容已超出A4的高度，需将该dom前插入一个空dom，把它挤下去，分割
	for (let i = 0; i < labelListID.length; i++) {
		let multiple = Math.ceil((labelListID[i].offsetTop + labelListID[i].offsetHeight) / pageHeight);
		if (isSplit(labelListID, i, multiple * pageHeight)) {
			let divParent = labelListID[i].parentNode; //获取该div的父节点
			let newNode = document.createElement('div');
			newNode.className = 'emptyDiv';
			newNode.style.background = '#ffffff';
			let _H = multiple * pageHeight - (labelListID[i].offsetTop + labelListID[i].offsetHeight);
			//留白
			newNode.style.height = _H + 30 + 'px';
			newNode.style.width = '100%';
			let next = labelListID[i].nextSibling; //获取div的下一个兄弟节点
			//判断兄弟节点是否存在
			if (next) {
				//存在则将新节点插入到div的下一个兄弟节点之前，即div之后
				divParent.insertBefore(newNode, next);
			} else {
				//不存在则直接添加到最后，appendChild默认添加到divParent的最后
				divParent.appendChild(newNode);
			}
		}
	}
	//开始截图
	this.$nextTick(() => {
		//nexttick 可保证要截图的部分全部执行完毕，
		html2Canvas(imageWrapper, {
			allowTaint: true,
			taintTest: false,
			useCORS: true,
			dpi: window.devicePixelRatio * 4, //将分辨率提高到特定的DPI提高4倍
			scale: 4 //按比例增加分辨率
		}).then((canvas) => {
			let pdf = new jsPDF('p', 'mm', 'a4'); //A4纸，纵向
			let ctx = canvas.getContext('2d'),
				a4w = 190,
				a4h = 277, //A4纸张大小 210mm*297mm， 四边各留10mm的边距，显示区域190 *277
				imgHeight = Math.floor((a4h * canvas.width) / a4w), //按照A4显示比例换算一也图像高度
				renderedHeight = 0;
			while (renderedHeight < canvas.height) {
				let page = document.createElement('canvas');
				page.width = canvas.width;
				page.height = Math.min(imgHeight, canvas.height - renderedHeight); //可能内容不足一页
				//通过使用getImageData 裁剪指定区域，并画到前面创建的canvas对象中
				page.getContext('2d')?.putImageData(ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)), 0, 0);
				pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, a4w, Math.min(a4h, (a4w * page.height) / page.width)); //添加图像到页面，保留10MM边距
				renderedHeight += imgHeight;
				if (renderedHeight < canvas.height) pdf.addPage(); //如果后面还有内容，添加一个空页
			}
			pdf.save(`${title}.pdf`);
		});
	});
};

app.use(VueNativeSock, 'ws://192.168.31.:7700/his-api/socket', {
	format: 'json',
	//if websocket连接长时间不收发请求，会被服务端切断连接，下 设置可以自动重连
	reconnection: true
});

//后端项目的URL根路径
// let baseUrl = 'https://192.168.31.143:7700/his-api';
let baseUrl = 'http://192.168.31.143:7700/his-api';
app.config.globalProperties.$baseUrl = baseUrl; //设置全局变量$baseUrl

//Minio服务器地址
let minioUrl = 'http://192.168.31.143:9000/his';
app.config.globalProperties.$minioUrl = minioUrl;

//配置 腾讯IM
import { TUIComponents, TUICore, genTestUserSig } from './TUIKit';

import { TUICallKit } from '@tencentcloud/call-uikit-vue';

const SDKAppID = 1600022521;
const TUIKit = TUICore.init({ SDKAppID });
TUIKit.use(TUIComponents);
TUIKit.use(TUICallKit);
app.use(TUIKit);

//封装全局Ajax公共函数
app.config.globalProperties.$http = function (url: string, method: string, data: JSON, async: boolean, fun: Function) {
	$.ajax({
		url: baseUrl + url,
		type: method,
		dataType: 'json',
		contentType: 'application/json',
		//上传的数据被序列化（允许Ajax上传数组）
		traditional: true,
		xhrFields: {
			//允许Ajax请求跨域
			withCredentials: true
		},
		headers: {
			token: localStorage.getItem('token')
		},
		async: async,
		data: JSON.stringify(data),
		success: function (resp: any) {
			if (resp.code == 200) {
				fun(resp);
			} else {
				ElMessage.error({
					message: resp.msg,
					duration: 1200
				});
			}
		},
		error: function (e: any) {
			//ajax有语法错误的时候
			if (e.status == undefined) {
				ElMessage.error({
					message: '前端页面错误',
					duration: 1200
				});
			} else {
				let status = e.status;
				//没有登陆体检系统
				if (status == 401) {
					if (url.startsWith('/front/')) {
						router.push({
							name: 'FrontIndex'
						});
					} else {
						router.push({
							name: 'MisLogin'
						});
					}
				} else {
					//后端没有运行，提交的数据有误，或者没有连接上后端项目
					if (!e.hasOwnProperty('responseText')) {
						ElMessage.error({
							message: '后端项目没有启动，或者HTTP请求类型以及参数错误',
							duration: 1200
						});
					} else {
						ElMessage.error({
							message: e.responseText,
							duration: 1200
						});
					}
				}
			}
		}
	});
};

//封装用于判断用户是否具有某些权限的公共函数
app.config.globalProperties.isAuth = function (permission: string[]) {
	const permissions: string | null = localStorage.getItem('permissions');
	if (permissions) {
		let flag = false;
		for (let one of permission) {
			if (permissions.includes(one)) {
				flag = true;
				break;
			}
		}
		return flag;
	} else {
		return false;
	}
};

app.mount('#app');
