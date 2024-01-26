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
					}
				]
			}
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
			}
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
