<template>
	<div v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:SELECT'])">
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
			<el-form-item>
				<el-select v-model="dataForm.place" placeholder="科室名称" clearable="clearable">
					<el-option v-for="one in data.placeList" :label="one" :value="one"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item prop="blueUuid">
				<el-input v-model="dataForm.blueUuid" placeholder="蓝牙信标UUID" maxlength="32" class="input"
					clearable="clearable"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="searchHandle()">查询</el-button>
				<el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'FLOW_REGULATION:INSERT'])"
					@click="addHandle()">新增</el-button>
				<el-button type="danger" :disabled="!proxy.isAuth(['ROOT', 'FLOW_REGULATION:DELETE'])"
					@click="deleteHandle()">批量删除</el-button>
			</el-form-item>
			<el-form-item class="mold">
				<el-switch v-model="dataForm.mode" size="large" active-text="自动调流" inactive-text="手动调流"
					:before-change="changeModeHandle"></el-switch>
			</el-form-item>
		</el-form>
		<el-table :data="data.dataList" :header-cell-style="{'background':'#f5f7fa'}" border v-loading="data.loading"
			@selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"
				:selectable="selectable"></el-table-column>
			<el-table-column type="index" header-align="center" align="center" width="100" label="序号">
				<template #default="scope">
					<span>{{(data.pageIndex - 1) * data.pageSize + scope.$index + 1 }}</span>
				</template>
			</el-table-column>
			<el-table-column prop="place" header-align="center" align="center" min-width="250"
				label="科室名称"></el-table-column>
			<el-table-column prop="blueUuid" header-align="center" align="center" min-width="270"
				label="蓝牙信标UUID"></el-table-column>
			<el-table-column prop="realNum" header-align="center" align="center" min-width="120"
				label="实际排队人数"></el-table-column>
			<el-table-column prop="maxNum" header-align="center" align="center" min-width="120"
				label="最大排队人数"></el-table-column>
			<el-table-column prop="weight" header-align="center" align="center" min-width="120"
				label="调流权重"></el-table-column>
			<el-table-column prop="priority" header-align="center" align="center" min-width="120"
				label="调流优先级"></el-table-column>
			<el-table-column header-align="center" align="center" width="150" label="操作">
				<template #default="scope">
					<el-button type="text" :v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:UPDATE'])"
						:disabled="scope.row.status" @click="updateHandle(scope.row.id)">修改</el-button>
					<el-button type="text" :v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:DELETE'])"
						@click="deleteHandle(scope.row.id)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
	</div>
	<el-dialog :title="!dialog.dataForm.id ? '新增' : '修改'"
		v-if="proxy.isAuth(['ROOT', 'FLOW_REGULATION:INSERT', 'FLOW_REGULATION:UPDATE'])" :close-on-click-modal="false"
		v-model="dialog.visible" width="450px">
		<el-form :model="dialog.dataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="80px">
			<el-form-item label="科室名称" prop="place">
				<el-input v-model="dialog.dataForm.place" placeholder="输入科室名称" maxlength="40" clearable></el-input>
			</el-form-item>
			<el-form-item label="蓝牙信标" prop="blueUuid">
				<el-input v-model="dialog.dataForm.blueUuid" placeholder="输入蓝牙信标UUID" maxlength="32"
					clearable></el-input>
			</el-form-item>
			<el-form-item label="排队上限">
				<el-input-number v-model="dialog.dataForm.maxNum" min="1" max="500" :step="10" step-strictly />
			</el-form-item>
			<el-form-item label="限流权重">
				<el-slider v-model="dialog.dataForm.weight" :step="1" show-stops :min="1" :max="10"> </el-slider>
			</el-form-item>
			<el-form-item label="优先级">
				<el-slider v-model="dialog.dataForm.priority" :step="1" show-stops :min="1" :max="10"> </el-slider>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialog.visible=false">取消</el-button>
				<el-button type="primary" @click="dataFormSubmit">确定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
	import { reactive, getCurrentInstance, ref } from 'vue';
	const { proxy } = getCurrentInstance();
	const dataForm = reactive({
		place: null,
		blueUuid: null,
		mode: null
	});

	const data = reactive({
		placeList: [],
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false,
		selections: []
	});
	const dataRule = reactive({
		blueUuid: [
			{ required: false, pattern: '^[a-zA-Z0-9]{32}$', message: '蓝牙信标UUID格式错误' }
		]
	});

	const dialog = reactive({
		visible: false,
		dataForm: {
			id: null,
			place: null,
			blueUuid: null,
			maxNum: 10,
			weight: 1,
			priority: 1
		},
		dataRule: {
			place: [
				{ required: true, message: '科室名称不能为空' },
				{ min: 2, message: '科室名称不能少于2个字符' },
				{ pattern: '^[a-zA-Z0-9\u4e00-\u9fa5\(\)]{2,40}$', message: '科室名称格式错误' }
			],
			blueUuid: [
				{ required: true, message: '蓝牙信标UUID不能为空' },
				{ pattern: '^[a-zA-Z0-9]{32}$', message: '蓝牙信标UUID格式错误' }
			]
		}
	})

	function loadPlaceList() {
		proxy.$http('/mis/flow_regulation/searchPlaceList', "GET", null, true, function (resp) {
			data.placeList = resp.result
		})
	}
	loadPlaceList();

	function loadMode() {
		proxy.$http('/mis/flow_regulation/searchMode', "GET", null, true, function (resp) {
			let result = resp.result
			dataForm.mode = result
		})
	}
	loadMode();

	function loadDataList() {
		data.loading = true;
		let json = { page: data.pageIndex, length: data.pageSize, place: dataForm.place, blueUuid: dataForm.blueUuid };
		proxy.$http('/mis/flow_regulation/searchByPage', "POST", json, true, function (resp) {
			let page = resp.page;
			let list = page.list;
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
				if (dataForm.place == '') {
					dataForm.place = null;
				}
				if (dataForm.blueUuid == '') {
					dataForm.blueUuid = null;
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

	function addHandle() {
		dialog.dataForm.id = null;
		dialog.dataForm.place = null;
		dialog.dataForm.bulueUuid = null;
		dialog.dataForm.maxNum = 10;
		dialog.dataForm.weight = 1;
		dialog.dataForm.priority = 1;
		dialog.visible = true;
		proxy.$nextTick(() => {
			proxy.$refs['dialogForm'].resetFields();
		});
	}

	function dataFormSubmit() {
		proxy.$refs['dialogForm'].validate(valid => {
			if (valid) {
				let json = {
					id: dialog.dataForm.id,
					place: dialog.dataForm.place,
					blueUuid: dialog.dataForm.blueUuid,
					maxNum: dialog.dataForm.maxNum,
					weight: dialog.dataForm.weight,
					priority: dialog.dataForm.priority
				};
				proxy.$http(
					`/mis/flow_regulation/${dialog.dataForm.id == null ? 'insert' : 'update'}`,
					'POST',
					json,
					true,
					function (resp) {
						if (resp.rows == 1) {
							proxy.$message({
								message: '操作成功',
								type: 'success',
								duration: 1200,
								onClose: () => {
									dialog.visible = false;
									loadDataList();
									loadPlaceList();
								}
							});
						} else {
							proxy.$message({
								message: '操作失败',
								type: 'warning',
								duration: 1200
							});
						}
					}
				);
			}
		});
	}

	function updateHandle(id) {
		dialog.dataForm.id = id;
		dialog.visible = true;
		proxy.$nextTick(() => {
			proxy.$refs['dialogForm'].resetFields();
			let json = { id: id };
			proxy.$http('/mis/flow_regulation/searchById', "POST", json, true, function (resp) {
				let result = resp.result;
				dialog.dataForm.place = result.place;
				dialog.dataForm.blueUuid = result.blueUuid;
				dialog.dataForm.maxNum = result.maxNum;
				dialog.dataForm.weight = result.weight;
				dialog.dataForm.priority = result.priority;
			});
		});
	}

	function selectionChangeHandle(val) {
		data.selections = val;
	}

	function selectable(row, index) {
		return true;
	}

	function deleteHandle(id) {
		let ids = id ? [id] : data.selections.map(item => { return item.id; });
		if (ids.length == 0) {
			proxy.$message({
				message: '没有选中记录',
				type: 'success',
				duration: 1200,
			});
		} else {
			proxy.$confirm(`确定要删除选中的记录？`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let json = { ids: ids };
				proxy.$http('/mis/flow_regulation/deleteByIds', "POST", json, true, function (resp) {
					if (resp.rows > 0) {
						proxy.$message({
							message: '操作成功',
							type: 'success',
							duration: 1200,
							onClose: () => {
								dialog.visible = false;
								loadDataList();
								loadPlaceList();
							}
						});
					} else {
						proxy.$message({
							message: '操作失败',
							type: 'warning',
							duration: 1200
						});
					}
				});
			});
		}
	}

	function changeModeHandle() {
		let json = { mode: !dataForm.mode };
		let flag = false;
		proxy.$http('/mis/flow_regulation/updateMode', "POST", json, true, function (resp) {
			if (resp.rows > 0) {
				proxy.$message({
					message: '切换成功',
					type: 'success',
					duration: 800,
				});
				flag = true;
			} else {
				proxy.$message({
					message: '操作失败',
					type: 'warning',
					duration: 800
				});
				flag = false;
			}
		});
		return flag
	}
</script>

<style lang="less" scoped>
	@import url('flow_regulation.less');
</style>