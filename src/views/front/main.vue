<template>
	<div class="container">
		<header>
			<div class="logo-container" @click="backIndex">
				<img src="../../assets/front/index/logo.png" class="logo" />
				<div>
					<h3>耀东大健康</h3>
					<p>www.chinahealty.com</p>
				</div>
			</div>
			<div class="search-container">
				<div>
					<el-input v-model="header.keyword" placeholder="请输入套餐或者编号" size="large" maxlength="50"
						class="keyword-input" clearable>
						<template #append>
							<el-button @click="searchGoods">搜索</el-button>
						</template>
					</el-input>
				</div>
				<div>
					<el-tag v-for="item in header.tags" :key="item.label" :type="item.type" class="tag" effect="light"
						round @click="tagHandle(item.label)">
						{{item.label}}
					</el-tag>
				</div>
			</div>
			<div class="operate-container">
				<el-button type="primary" size="large" v-if="dialog.status == 'logout'" @click="showDialog">
					登录/注册
				</el-button>
				<div class="btn" v-if="dialog.status == 'login'" @click="router.push({name:'FrontMine'})">
					<el-icon>
						<User />
					</el-icon>
					<span>个人中心</span>
				</div>
				<div class="btn" v-if="dialog.status == 'login'" @click="logout">
					<el-icon>
						<SwitchButton />
					</el-icon>
					<span>退出系统</span>
				</div>
			</div>
		</header>
		<!-- 避免路由引用页面的时候浏览器不刷新内容，所以给URL添加随机数参数 -->
		<router-view :key="router.currentRoute.value.query.random" />
	</div>
	<footer>
		<div class="aboutus-container">
			<ul class="list">
				<li class="item">
					<img src="../../assets/front/index/d1.svg" />
					<div>
						<h3>官方直营</h3>
						<p>600余家体验中心线上预约、专注健康体检17年</p>
					</div>
				</li>
				<li class="item">
					<img src="../../assets/front/index/d2.svg" />
					<div>
						<h3>团队优势</h3>
						<p>标准化、智能化的医疗质量管理体系，打造全生命周期健康管理服务</p>
					</div>
				</li>
				<li class="item">
					<img src="../../assets/front/index/d3.svg" />
					<div>
						<h3>专业保证</h3>
						<p>拥有行业专家、医技护人员等近35000人组成的专业医疗服务团队</p>
					</div>
				</li>
				<li class="item">
					<img src="../../assets/front/index/d4.svg" />
					<div>
						<h3>售后服务</h3>
						<p>未消费订单及时退、过期退、体检保障和隐私保障</p>
					</div>
				</li>
			</ul>
		</div>
		<div class="other-container">
			<ul class="list">
				<li class="left">
					<img src="../../assets/front/index/service.png" />
					<p class="tel">4008-6478-5023</p>
				</li>
				<li>
					<ul class="link-list">
						<li><a href="">关于我们</a></li>
						<li><a href="">企业简介</a></li>
						<li><a href="">发展历程</a></li>
						<li><a href="">产业生态圈</a></li>
						<li><a href="">企业文化</a></li>
					</ul>
				</li>
				<li>
					<ul class="link-list">
						<li><a href="">每年资讯</a></li>
						<li><a href="">企业新闻</a></li>
						<li><a href="">媒体报道</a></li>
						<li><a href="">党建工作</a></li>
					</ul>
				</li>
				<li>
					<ul class="link-list">
						<li><a href="">客户服务</a></li>
						<li><a href="">帮助中心</a></li>
						<li><a href="">预约通道</a></li>
						<li><a href="">售后资讯</a></li>
						<li><a href="">隐私政策</a></li>
					</ul>
				</li>
				<li>
					<ul class="link-list">
						<li><a href="">业务合作</a></li>
						<li><a href="">友情链接</a></li>
						<li><a href="">联系我们</a></li>
					</ul>
				</li>
				<li class="right">
					<div class="ercode">
						<p>微信公众号</p>
						<img src="../../assets/front/index/ercode-1.png" />
					</div>
					<div class="ercode">
						<p>微信公众号</p>
						<img src="../../assets/front/index/ercode-2.png" />
					</div>
				</li>
			</ul>
		</div>
	</footer>
	<el-dialog v-model="dialog.visible" title="手机快速登陆" width="400" class="dialog">
		<el-row>
			<el-col :span="24">
				<el-input v-model="dialog.tel" placeholder="输入手机号,快捷登陆" size="large" maxlength="11" clearable>
					<template #prepend>
						<el-icon>
							<Iphone />
						</el-icon>
					</template>
				</el-input>
			</el-col>
		</el-row>
		<el-row :gutter="10">
			<el-col :span="16">
				<el-input v-model="dialog.code" placeholder="输入短信验证码" size="large" maxlength="6" clearable>
					<template #prepend>
						<el-icon>
							<Message />
						</el-icon>
					</template>
				</el-input>
			</el-col>
			<el-col :span="8">
				<el-button size="large" class="receive-btn" type="primary" plain @click="sendSmsCode"
					:disabled="dialog.disabled">
					{{dialog.btnContent}}
				</el-button>
			</el-col>
		</el-row>
		<el-button type="primary" class="login-btn" size="large" @click="login">登录系统</el-button>
	</el-dialog>
</template>

<script lang="ts" setup>
	import { isMobile, isBlank, isSmsCode } from '../../utils/validate';
	import router from '../../router/index';
	import { reactive, ref, getCurrentInstance, onMounted } from 'vue';
	const { proxy } = getCurrentInstance();
	const header = reactive({
		keyword: '',
		tags: [
			{
				label: '入职体检',
				type: 'info'
			},
			{
				label: '父母体检',
				type: 'info'
			},
			{
				label: '女士体检',
				type: 'info'
			}
		]
	});

	const dialog = reactive({
		visible: false,
		tel: null,
		code: null,
		disabled: false,
		btnContent: '获取短信验证码',
		num: 0,
		status: 'logout'
	});

	let keyword = router.currentRoute.value.query.keyword;//URL获取地址keyword参数，更新到文本框，避免页面刷新后文本框没有数据
	header.keyword = keyword;

	function searchGoods() {
		router.push(
			{
				name: 'FrontGoodsList',
				query: { keyword: header.keyword, random: new Date().getTime() },
			}
		);
	}

	function tagHandle(label : string) {
		header.keyword = label;
	}

	function showDialog() {
		dialog.visible = true;
	}

	function sendSmsCode() {
		console.log('sendSmsCode');
		if (isBlank(dialog.tel)) {
			proxy.$message({
				message: '请填写手机号码',
				type: 'error',
				duration: 1200
			});
		} else if (!isMobile(dialog.tel)) {
			proxy.$message({
				message: '手机号码错误',
				type: 'error',
				duration: 1200
			});
		} else {
			console.log('sendSmsCode123');
			let json = { tel: dialog.tel };
			proxy.$http('/front/customer/sendSmsCode', 'POST', json, true, function (resp) {
				if (resp.result) {
					console.log(resp.result);
					proxy.$message({
						message: '短信验证码已发送',
						type: 'success',
						duration: 1200
					});
					dialog.num = 0;
					dialog.disabled = true;
					//禁用按钮2minutes
					let timer = setInterval(function () {
						dialog.num++;
						dialog.btnContent = `重新获取(${120 - dialog.num})`;
						if (dialog.num == 120) {
							clearInterval(timer);
							dialog.disabled = false;
							dialog.btnContent = '获取短信验证码';
						}
					}, 1000);
				}

			});
		}
	}

	function login() {
		if (isBlank(dialog.tel)) {
			proxy.$message({
				message: '请填写手机号码',
				type: 'error',
				duration: 1200
			});
		} else if (!isMobile(dialog.tel)) {
			proxy.$message({
				message: '手机号码错误',
				type: 'error',
				duration: 1200
			});
		} else if (isBlank(dialog.code)) {
			proxy.$message({
				message: '请填写短信验证码',
				type: 'error',
				duration: 1200
			});
		} else if (!isSmsCode(dialog.code)) {
			proxy.$message({
				message: '短信验证码错误',
				type: 'error',
				duration: 1200
			});
		}
		let json = { tel: dialog.tel, code: dialog.code };
		proxy.$http('/front/customer/login', 'POST', json, true, function (resp) {
			let result = resp.result;
			if (result) {
				proxy.$message({
					message: resp.msg,
					type: 'success',
					duration: 1200
				});
				dialog.tel = null;
				dialog.code = null;
				dialog.visible = false;
				dialog.status = 'login';
				let token = resp.token;
				localStorage.setItem("token", token);
			} else {
				proxy.$message({
					message: resp.msg,
					type: 'error',
					duration: 1200
				});
			}
		});
	}

	function logout() {
		proxy.$http('/front/customer/logout', 'GET', null, true, function (resp) {
			localStorage.removeItem('token');
			dialog.status = 'logout';
			router.push({ name: 'FrontIndex' });
			proxy.$message({
				message: '已经退出系统',
				type: 'success',
				duration: 1200
			});
		});
	}

	let token = localStorage.getItem('token');
	if (token != null) {
		proxy.$http('/front/customer/checkLogin', 'GET', null, true, function (resp) {
			if (resp.result) {
				dialog.status = 'login';
			} else {
				dialog.status = 'logout';
			}
		});
	}

	function backIndex() {
		router.push({ name: 'FrontIndex' });
	}
</script>

<style lang="less" scoped>
	@import url('main.less');
</style>