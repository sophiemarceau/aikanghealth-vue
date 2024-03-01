import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
const history = createWebHistory();
const routes: Array<RouteRecordRaw> = [
	{
		path: '/front',
		name: 'Front',
		component: () => import('../views/front/main.vue'),
		children: [
			{
				path: 'index',
				name: 'FrontIndex',
				component: () => import('../views/front/index.vue')
			},
			{
				path: 'goods/:id',
				name: 'FrontGoods',
				component: () => import('../views/front/goods.vue')
			},
			{
				path: 'goods_list',
				name: 'FrontGoodsList',
				component: () => import('../views/front/goods_list.vue')
			},
			{
				path: 'customer',
				name: 'FrontCustomer',
				component: () => import('../views/front/customer.vue'),
				children: [
					{
						path: 'mine',
						name: 'FrontMine',
						component: () => import('../views/front/mine.vue')
					},
					{
						path: 'order_list',
						name: 'FrontOrderList',
						component: () => import('../views/front/order_list.vue')
					},
					{
						path: 'customer_im',
						name: 'FrontCustomerIm',
						component: () => import('../views/front/customer_im.vue')
					},
					{
						path: 'appointment_list',
						name: 'FrontAppointmentList',
						component: () => import('../views/front/appointment_list.vue')
					}
				]
			},
			{
				path: 'goods_snapshot/:id/:mode',
				name: 'FrontGoodsSnapshot',
				component: () => import('../views/front/goods_snapshot.vue')
			},
		]
	},
	{
		path: '/systemmis',
		name: 'Main',
		component: () => import('../views/systemmis/main.vue'),
		children: [
			{
				path: 'home',
				name: 'MisHome',
				component: () => import('../views/systemmis/home.vue'),
				meta: {
					title: '首页'
				}
			},
			{
				path: 'dept',
				name: 'MisDept',
				component: () => import('../views/systemmis/dept.vue'),
				meta: {
					title: '部门管理',
					isTab: true
				}
			},
			{
				path: 'role',
				name: 'MisRole',
				component: () => import('../views/systemmis/role.vue'),
				meta: {
					title: '角色管理',
					isTab: true
				}
			},
			{
				path: 'user',
				name: 'MisUser',
				component: () => import('../views/systemmis/user.vue'),
				meta: {
					title: '用户管理',
					isTab: true
				}
			},
			{
				path: 'goods',
				name: 'MisGoods',
				component: () => import('../views/systemmis/goods.vue'),
				meta: {
					title: '体检套餐',
					isTab: true
				}
			},
			{
				path: 'order',
				name: 'MisOrder',
				component: () => import('../views/systemmis/order.vue'),
				meta: {
					title:'订单管理',
					isTab: true
				}
			},
			{
				path:'rule',
				name:'MisRule',
				component:() => import('../views/systemmis/rule.vue'),
				meta:{
					title:'促销规则',
					isTab: true
				}
			},
			{
				path:'customer_im',
				name:'MisCustomerIm',
				component:() => import('../views/systemmis/customer_im.vue'),
				meta:{
					title:'客服IM',
					isTab: true
				}
			},
			{
				path: 'appointment',
				name: 'MisAppointment',
				component: () => import('../views/systemmis/appointment.vue'),
				meta:{
					title:'体检预约',
					isTab: true
				}
			},
			{
				path: 'customer_checkin',
				name: 'MisCustomerCheckin',
				component: () => import('../views/systemmis/customer_checkin.vue'),
				meta:{
					title:'体检签到',
					isTab: true
				}
			},
			{
				path: 'checkup',
				name: 'MisDoctorCheckup',
				component: () => import('../views/systemmis/doctor_checkup.vue'),
				meta:{
					title:'医生检查',
					isTab: true
				}
			},
			{
				path: 'flow_regulation',
				name: 'MisFlowRegulation',
				component: () => import('../views/systemmis/flow_regulation.vue'),
				meta:{
					title:'人员限流',
					isTab: true
				}
			},
			{
				path: 'checkup_report',
				name: 'MisCheckupReport',
				component: () => import('../views/systemmis/checkup_report.vue'),
				meta:{
					title:'体检报告',
					isTab: true
				}
			},
		]
	},
	{
		path: '/systemmis/login',
		name: 'MisLogin',
		component: () => import('../views/systemmis/login.vue')
	},
	{
		path: '/404',
		name: '404',
		component: () => import('../views/404.vue')
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/404'
	}
];
const router = createRouter({
	history,
	routes
});

router.beforeEach((to, from, next) => {
	let permissions = localStorage.getItem('permissions');
	let token = localStorage.getItem('token');
	let fullPath = to.fullPath;
	if (fullPath.startsWith('/mis') && fullPath != '/mis/login') {
		if (permissions == null || permissions == '' || token == null || token == '') {
			next({ name: 'MisLogin' });
		} else {
			return next();
		}
	} else if (fullPath.startsWith('/front/customer') || fullPath.startsWith('/front/goods_snapshot')) {
		if (token == null || token == '') {
			next({ name: 'FrontIndex' });
		} else {
			return next();
		}
	} else {
		return next();
	}
});

export default router;
