<template>
	<div class="summary-container">
		<el-card class="box-card" shadow="never">
			<div class="info">
				<div class="left">
					<el-avatar :size="45" shape="square" :src="data.photo">
						<el-icon size="25">
							<UserFilled />
						</el-icon>
					</el-avatar>
				</div>
				<div class="right">
					<div class="base">
						<span>姓名：{{data.name}}</span>
						<span>性别：{{data.sex}}</span>
						<span>电话号码：{{data.tel}}</span>
						<div class="operate" @click="updateHandle">
							<el-icon :size="18">
								<Edit />
							</el-icon>
							<div>修改资料</div>
						</div>
					</div>
					<p>注册时间：{{data.createTime}}</p>
				</div>
			</div>
			<el-divider></el-divider>
			<el-row :gutter="16">
				<el-col :span="6">
					<div class="statistic-card">
						<el-statistic :value="data.amount" suffix="元">
							<template #title>
								<div class="title">
									累计消费金额
								</div>
							</template>
						</el-statistic>
					</div>
				</el-col>
				<el-col :span="5">
					<div class="statistic-card">
						<el-statistic :value="data.count" suffix="笔">
							<template #title>
								<div class="title">
									有效订单数量
								</div>
							</template>
						</el-statistic>
					</div>
				</el-col>
				<el-col :span="5">
					<div class="statistic-card">
						<el-statistic :value="data.number" suffix="个">
							<template #title>
								<div class="title">
									体检套餐数量
								</div>
							</template>
						</el-statistic>
					</div>
				</el-col>
			</el-row>

		</el-card>

	</div>
	<el-dialog title="修改资料" :close-on-click-modal="false" v-model="dialog.visible" width="420px">
		<el-form :model="dialog.dataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="60px">
			<el-form-item label="姓名" prop="name">
				<el-input v-model="dialog.dataForm.name" placeholder="输入姓名" maxlength="10" size="medium" class="input"
					clearable />
			</el-form-item>
			<el-form-item label="性别" progress="sex">
				<el-select v-model="dialog.dataForm.sex" placeholder="选择性别" size="medium" clearable="clearable">
					<el-option label="男" value="男"></el-option>
					<el-option label="女" value="女"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="电话" prop="tel">
				<el-input v-model="dialog.dataForm.tel" placeholder="输入电话" maxlength="11" size="medium" class="input"
					clearable />
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button size="medium" @click="dialog.visible=false">
					取消
				</el-button>
				<el-button type="primary" size="medium" @click="dataFormSubmit">
					确定
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
	import { reactive, ref, Ref, getCurrentInstance } from 'vue';
	import router from '../../router/index';
	const { proxy } = getCurrentInstance();
	const data = reactive({
		name: null,
		sex: null,
		tel: null,
		photo: null,
		createTime: null,
		count: 0,
		number: 0,
		amount: 0
	});
	const dialog = reactive({
		visible: false,
		dataForm: {
			name: null,
			tel: null,
			sex: null
		},
		dataRule: {
			name: [{ pattern: '^[\u4e00-\u9fa5]{2,10}$', message: '姓名内容错误' }],
			tel: [
				{ required: true, message: '电脑号码不能为空' },
				{
					pattern: '^1[1-9]\\d{9}$',
					message: '电话格式错误'
				}
			]
		}
	});
	function loadData() {
		proxy.$http('/front/customer/searchSummary', 'GET', null, true, function (resp) {
			let result = resp.result;
			data.name = result.name == null ? '未填写' : result.name;
			data.sex = result.sex == null ? '未填写' : result.sex;
			data.tel = result.tel;
			data.photo = result.photo;
			data.createTime = result.createTime;
			data.count = result.count;
			data.number = result.numnber;
			data.amount = result.amount;
		});
	}
	loadData();

	function updateHandle() {
		dialog.visible = true;
		proxy.$nextTick(() => {
			proxy.$refs['dialogForm'].resetFields();
			dialog.dataForm.name = (data.name == '未填写' ? null : data.name);
			dialog.dataForm.sex = (data.sex == '未填写' ? null : data.sex);
			dialog.dataForm.tel = data.tel;
		});
	}

	function dataFormSubmit() {
		proxy.$refs['dialogForm'].validate(valid => {
			if (valid) {
				proxy.$http('/front/customer/update', 'POST', dialog.dataForm, true, function (resp) {
					if (resp.result) {
						proxy.$message({
							message: '个人资料更新成功',
							type: 'success',
							duration: 1200,
							onClose: () => {
								dialog.visible = false;
								loadData();
							}
						});
					}
				});
			}
		});
	}
</script>

<style lang="less" scoped>
	@import url(mine.less);
</style>