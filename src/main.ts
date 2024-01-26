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

app.use(VueNativeSock, 'ws://localhost:7700/his-api/socket', {
	format: 'json', 
	//if websocket连接长时间不收发请求，会被服务端切断连接，下 设置可以自动重连
	reconnection: true
});

//后端项目的URL根路径
// let baseUrl = 'https://localhost:7700/his-api';
let baseUrl = 'http://localhost:7700/his-api';
app.config.globalProperties.$baseUrl = baseUrl; //设置全局变量$baseUrl

//Minio服务器地址
let minioUrl = 'http://localhost:9000/his';
app.config.globalProperties.$minioUrl = minioUrl;

//封装全局Ajax公共函数
app.config.globalProperties.$http = function (url : string, method : string, data : JSON, async : boolean, fun : Function) {
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
        success: function (resp : any) {
            if (resp.code == 200) {
                fun(resp);
            } else {
                ElMessage.error({
                    message: resp.msg,
                    duration: 1200
                });
            }
        },
        error: function (e : any) {
            //ajax有语法错误的时候
            if (e.status == undefined) {
                ElMessage.error({
                    message: '前端页面错误',
                    duration: 1200
                });
            } 
            else {
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
                } 
                else {
                    //后端没有运行，提交的数据有误，或者没有连接上后端项目
                    if (!e.hasOwnProperty('responseText')) {
                        ElMessage.error({
                            message: '后端项目没有启动，或者HTTP请求类型以及参数错误',
                            duration: 1200
                        });
                    } 
                    else {
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
app.config.globalProperties.isAuth = function(permission: string[]) {
	const permissions : string | null = localStorage.getItem('permissions');
	if (permissions) {
		let flag = false;
		for (let one of permission)	{
			if (permissions.includes(one)) {
				flag = true;
				break;
			} 
		}
		return flag;
	} else {
		return false;
	}
}

app.mount('#app');
