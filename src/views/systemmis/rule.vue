<template>
	<div v-if="proxy.isAuth(['ROOT', 'RULE:SELECT'])">
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
			<el-form-item prop="name">
				<el-input v-model="dataForm.name" placeholder="规则名称" maxlength="20" class="input"
					clearable="clearable" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="searchHandle()">查询</el-button>
				<el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'RULE:INSERT'])" @click="addHandle()">
					新增
				</el-button>
			</el-form-item>
		</el-form>
	</div>
	<el-table :data="data.dataList" :header-cell-style="{'background': '#faf7fa'}" border v-loading="data.loading">
		<el-table-column type="index" header-align="center" align="center" width="100" label="序号">
			<template #default="scope">
				<span>{{(data.pageIndex - 1) * data.pageSize + scope.$index + 1}}</span>
			</template>
		</el-table-column>
		<el-table-column prop="name" header-align="left" align="left" min-width="150" label="规则名称"></el-table-column>
		<el-table-column prop="remark" header-align="left" align="left" min-width="350" label="备注信息"></el-table-column>
		<el-table-column prop="count" header-align="center" align="center" min-width="80"
			label="关联套餐数量"></el-table-column>
		<el-table-column header-align="center" align="center" width="150" label="操作">
			<template #default="scope">
				<el-button type="text" v-if="proxy.isAuth(['ROOT', 'RULE:UPDATE'])"
					@click="updateHandle(scope.row.id)">修改</el-button>
				<el-button type="text" :disabled="scope.row.count>0" v-if="proxy.isAuth(['ROOT', 'RULE:DELETE'])"
					@click="deleteHandle(scope.row.id)">删除</el-button>
			</template>
		</el-table-column>

	</el-table>
	<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="data.pageIndex"
		:page-sizes="[10, 20, 50]" :page-size="data.pageSize" :total="data.totalCount"
		layout="total, sizes, prev, pager, next, jumper">
	</el-pagination>
</template>

<script lang="ts" setup>
	import { getCurrentInstance, reactive, ref, onMounted } from 'vue';
	import { Delete } from '@element-plus/icons-vue';
	import router from '../../router/index';
	const { proxy } = getCurrentInstance();

	const dataForm = reactive({
		name: null
	});
	const dataRule = reactive({
		name: [
			{ pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$', message: '规则名称不正确' }
		]
	});
	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false
	});
</script>

<style lang="less">
</style>