<template>
	<div v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])">
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
			<el-form-item>
				<el-date-picker v-model="dataForm.date" type="date" placeholder="选择日期" :editable="false"
					format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
			</el-form-item>
			<el-form-item prop="name">
				<el-input v-model="dataForm.name" placeholder="姓名" maxlength="10" class="input" clearable></el-input>
			</el-form-item>
			<el-form-item prop="tel">
				<el-input v-model="dataForm.tel" placeholder="电话号码" maxlength="11" class="input" clearable></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="searchHandle()">查询</el-button>
				<el-button type="danger" :disabled="!proxy.isAuth(['ROOT', 'APPOINTMENT:DELETE'])"
					@click="deleteHandle()">批量删除</el-button>
			</el-form-item>
			<el-form-item class="mold">
				<el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
					<el-radio-button label="全部"></el-radio-button>
					<el-radio-button label="未签到"></el-radio-button>
					<el-radio-button label="已签到"></el-radio-button>
					<el-radio-button label="已结束"></el-radio-button>
					<el-radio-button label="已关闭"></el-radio-button>
				</el-radio-group>
			</el-form-item>
		</el-form>

		<el-table :data="data.dataList" :header-cell-style="{'background':'#f5f7fa'}" border v-loading="data.loading"
			@selection-change="selectionChangeHandle">
			<el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"
				fixed />
			<el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
				<template #default="scope">
					<span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="name" header-align="center" align="center" label="姓名" width="200" />
			<el-table-column prop="sex" header-align="center" align="center" label="性别" width="100" />
			<el-table-column prop="age" header-align="center" align="center" label="年龄" width="100" />
			<el-table-column prop="tel" header-align="center" align="center" label="联系电话" width="150" />
			<el-table-column prop="pid" header-align="center" align="center" label="身份证号码" width="190" />
			<el-table-column prop="company" header-align="center" align="center" label="公司名称" width="200" />
			<el-table-column prop="title" header-align="center" align="center" label="体检套餐" min-width="200" />
			<el-table-column prop="status" header-align="center" align="center" label="状态" width="120" />
			<el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
					<template #default="scope">
						<el-button type="text" :disabled="!proxy.isAuth(['ROOT', 'APPOINTMENT:DELETE']) || scope.row.status!='未签到'" @click="deleteHandle(scope.row.id)">删除</el-button>
						
					</template>
				</el-table-column>
		</el-table>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
		</el-pagination>
	</div>
</template>


<script lang="ts" setup>
	import { reactive, ref, Ref, getCurrentInstance } from 'vue';
	import { Search } from '@element-plus/icons-vue';
	import router from '../../router/index';
	import { dayjs } from 'element-plus';
	import isBetween from 'dayjs/plugin/isBetween';
	dayjs.extend(isBetween);
	const { proxy } = getCurrentInstance();
	const dataForm = reactive({
		name: null,
		tel: null,
		date: null,
		statusLabel: '全部',
		status: null
	});
	const dataRule = reactive({
		name: [
			{ pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误' }
		],
		tel: [
			{ pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }
		]
	});
	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false,
		selections: []
	});

	function loadDataList() {
		data.loading = true;
		if (dataForm.statusLabel == '全部') {
			dataForm.status = null;
		} else if (dataForm.statusLabel == '未签到') {
			dataForm.status = 1;
		} else if (dataForm.statusLabel == '已签到') {
			dataForm.status = 2;
		} else if (dataForm.statusLabel == '已结束') {
			dataForm.status = 3;
		} else if (dataForm.statusLabel == '已关闭') {
			dataForm.status = 4;
		}
		let json = {
			name: dataForm.name,
			tel: dataForm.tel,
			date: dataForm.date,
			status: dataForm.status,
			page: data.pageIndex,
			length: data.pageSize
		};
		proxy.$http('/mis/appointment/searchByPage', 'POST', json, true, function (resp) {
			let page = resp.page;
			let list = page.list;
		
			let statusEnum = {
				"1": "未签到",
				"2": "已签到",
				"3": "已结束",
				"4": "已关闭"
			};
			for (let one of list) {
				one.status = statusEnum[one.status + ""]
			}
			data.dataList = list;
			data.totalCount = page.totalCount;
			data.loading = false;
		});
	}
	loadDataList();

	function searchHandle() {
		proxy.$refs['form'].validate(valid => {
			if (valid) {
				proxy.$refs['form'].clearValidate();
				if (dataForm.date == '') {
					dataForm.date = null;
				}
				if (dataForm.name == '') {
					dataForm.name = null;
				}
				if (dataForm.tel == '') {
					dataForm.tel = null;
				}
				if (dataForm.pageIndex != 1) {
					dataForm.pageIndex = 1;
				}
				loadDataList();
			} else {
				return false;
			}
		});
	}

	function sizeChangeHandle(val) {
		data.pageSize = val;
		data.pageIndex = 1;
		loadDataList();
	}

	function currentChangeHandle(val) {
		data.pageIndex = val;
		loadDataList();
	}

	function selectionChangeHandle(val) {
		data.selections = val;
	}

	function selectable(row, index) {
		if (row.status != '未签到') {
			return false;
		}
		return true;
	}
	
	function deleteHandle(id) {
		let ids = id
			? [id] : data.selections.map(item => {
				return item.id;
			});
		if (ids.length == 0) {
			proxy.$message({
				message: '没有选中记录',
				type: 'warning',
				duration: 1200
			});
		} else {
			proxy.$confirm('确定要删除选中的记录？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
	
			}).then(() => {
				let json = { ids: ids };
				console.log(json);
				proxy.$http('/mis/appointment/deleteByIds', 'POST', json, true, function (resp) {
					if (resp.rows > 0) {
						proxy.$message({
							message: '操作成功',
							type: 'success',
							duration: 1200,
							onClose: () => {
								loadDataList()
							}
						});
					} else {
						proxy.$message({
							message: '未能删除记录',
							type: 'warning',
							duration: 1200
						});
					}
				});
			});
		}
	}
</script>

<style lang="less" scoped>
	@import url('appointment.less');
</style>