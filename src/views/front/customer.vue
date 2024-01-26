<template>
	<div class="customer-container">
		<el-menu :default-active="active" class="menu" @select="selectHandle">
			<el-menu-item index="FrontMine">
				<el-icon>
					<User />
				</el-icon>
				<span>账户信息</span>
			</el-menu-item>
			<el-menu-item index="FrontOrderList">
				<el-icon>
					<Tickets />
				</el-icon>
				<span>我的订单</span>
			</el-menu-item>
			<el-menu-item index="FrontAppointmentList">
				<el-icon>
					<Files />
				</el-icon>
				<span>体检预约</span>
			</el-menu-item>
			<el-menu-item index="FrontCustomerIm">
				<el-icon>
					<Collection />
				</el-icon>
				<span>客服咨询</span>
			</el-menu-item>
		</el-menu>
		<div class="content">
			<router-view />
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { reactive, ref, Ref, getCurrentInstance } from 'vue';
	import router from '../../router/index';
	const { proxy } = getCurrentInstance();
	let active = ref('FrontMine');
	let name = router.currentRoute.value.name;
	active = ref(name);
	
	function selectHandle(index) {
		active = ref(index);
		router.push({ name: index });
	}
</script>

<style lang="less" scoped>
	@import url('customer.less');
</style>