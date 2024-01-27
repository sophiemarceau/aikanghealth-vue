<template>
	<div class="page">
		<div class="panel">
			<div class="left">
				<img src="../../assets/login/pr_logo.png" class="logo" />
				<img src="../../assets/login/newbig.jpg" class="big" />
			</div>
			<div class="right">
				<div class="title-container">
					<h2>耀东大健康体检系统</h2>
					<span>V1.0</span>
				</div>
				<div v-if="!qr.qrCodeVisible">
					<div class="row">
						<el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="user" size="large"
							clearable />
					</div>
					<div class="row">
						<el-input type="password" v-model="loginForm.password" placeholder="密码" prefix-icon="Lock"
							size="large" clearable></el-input>
					</div>
					<div class="row">
						<el-button type="primary" class="btn" size="large" @click="login">
							登陆系统
						</el-button>
					</div>
					<div class="row"><a class="link">二维码登陆</a></div>
				</div>
				<div v-if="qr.qrCodeVisible">
					<div class="qrCode-container">
						<img :src="qr.qrCode" height="153" class="qrCode" />
						<img src="../../assets/login/phone.png" height="148" />
					</div>
					<div class="row"><a class="link">用户名密码登陆</a></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { getCurrentInstance, reactive, ref } from 'vue';
	import { isUsername, isPassword } from '../../utils/validate';
	//当用户登陆成功后，需要使用路由对象跳转页面
	import router from '../../router/index';

	const { proxy } = getCurrentInstance();

	const loginForm = reactive({
		username: null,
		password: null
	});

	//这部分内容将来给APP程序使用
	const qr = reactive({
		qrCodeVisible: false,
		qrCode: '',
		uuid: null,
		qrCodeTimer: null,
		loginTimer: null
	});

	function login() {
	    if (!isUsername(loginForm.username)) {
	        proxy.$message({
	            message: '用户名不正确',
	            type: 'error',
	            duration: 1200
	        });
	    }
	    else if (!isPassword(loginForm.password)) {
	        proxy.$message({
	            message: '密码不正确',
	            type: 'error',
	            duration: 1200
	        });
	    }
	    else {
	        const data = {
	            username: loginForm.username,
	            password: loginForm.password
	        };
	        proxy.$http('/mis/user/login', 'POST', data, true, resp => {
	            if (resp.result) {
	                const permissions = resp.permissions;
	                const token = resp.token;
	                //向浏览器storage保存令牌和权限列表
	                localStorage.setItem('permissions', permissions);
	                localStorage.setItem('token', token);
	                //跳转页面
					console.log(resp);
	                router.push({ name: 'MisHome' });
	            } else {
	                proxy.$message({
	                    message: '登陆失败',
	                    type: 'error',
	                    duration: 1200
	                });
	            }
	        });
	    }
	
	}
</script>

<style lang="less" scoped="scoped">
	@import url('login.less');
</style>