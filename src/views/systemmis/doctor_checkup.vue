<template>
	<div class="person-container" v-if="proxy.isAuth(['ROOT', 'CHECKUP:INSERT','CHECKUP:UPDATE'])">
		<div class="left">
			<el-descriptions title="【 体检人信息 】" direction="vertical" :column="5" border>
				<template #extra>
					<div class="operate">
						<el-input placeholder="输入 / 扫码体检编号" v-model="data.dataForm.uuid" ref="uuid" class="uuid"
							maxlength="32" @keyup.enter.native="searchHandle" clearable />
						<el-button type="primary" @click="searchHandle">执行查询</el-button>
					</div>
				</template>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<User />
							</el-icon>
							姓名
						</div>
					</template>
					{{data.customer.name}}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<Male />
							</el-icon>
							性别
						</div>
					</template>
					{{data.customer.sex}}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<Calendar />
							</el-icon>
							年龄
						</div>
					</template>
					{{data.customer.age}}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<Phone />
							</el-icon>
							电话号码
						</div>
					</template>
					{{data.customer.tel}}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<Postcard />
							</el-icon>
							体检编号
						</div>
					</template>
					{{data.customer.uuid}}
				</el-descriptions-item>
			</el-descriptions>
		</div>
		<div class="right">
			<el-descriptions title="【 医生信息 】" direction="vertical" :column="5" border>
				<template #extra>
					<el-button type="primary" @click="selectDeptHandle">选择科室</el-button>
				</template>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<User />
							</el-icon>
							姓名
						</div>
					</template>
					{{ data.doctor.name }}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<Male />
							</el-icon>
							性别
						</div>
					</template>
					{{ data.doctor.sex }}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<Phone />
							</el-icon>
							电话号码
						</div>
					</template>
					{{ data.doctor.tel }}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<OfficeBuilding />
							</el-icon>
							体检科室
						</div>
					</template>
					{{ data.dataForm.place }}
				</el-descriptions-item>
				<el-descriptions-item align="center">
					<template #label>
						<div class="cell-item">
							<el-icon class="icon">
								<Calendar />
							</el-icon>
							当前日期
						</div>
					</template>
					{{ data.doctor.date }}
				</el-descriptions-item>
			</el-descriptions>
		</div>
	</div>
	<div class="checkup-container">
		<table>
			<tr>
				<th>序号</th>
				<th align="left">体检项</th>
				<th align="left">检查结果</th>
			</tr>
			<tr v-for="(one,index) in data.dataForm.checkup">
				<td width="100" align="center">{{index+1}}</td>
				<td width="300">{{one.item}}</td>
				<td>
					<div class="value-container">
						<el-select v-model="one.input.select" class="m-2" placeholder="选择模板值">
							<el-option v-for="item in one.value" :label="item" :value="item" />
						</el-select>
						<el-input v-model="one.input.value" :disabled="one.input.select!='其他'" placeholder="输入体检值"
							class="input-value" clearable />
					</div>
				</td>
			</tr>
		</table>
		<div class="operate" v-if="data.dataForm.checkup.length>0">
			<el-button type="danger" size="large" @click="clearCheckupHandle">
				重置数据
			</el-button>
			<el-button type="primary" size="large" @click="dataFormSubmit">
				提交体检结果
			</el-button>
		</div>
	</div>
	<el-dialog title="选择科室" v-if="proxy.isAuth(['ROOT', 'CHECKUP:INSERT', 'CHECKUP:UPDATE'])"
		:close-on-click-modal="false" v-model="dialog.visible" width="300px">
		<el-form :model="data.dataForm" ref="dialogForm" :rules="dialog.dataRule" label-width="80px">
			<el-form-item label="科室名称" prop="place">
				<el-select v-model="data.dataForm.place" placeholder="选择科室" clearable="clearable"
					@change="changePlaceHandle">
					<el-option label="外科" value="外科" />
					<el-option label="内科" value="内科" />
					<el-option label="眼科" value="眼科" />
					<el-option label="耳鼻喉科" value="耳鼻喉科" />
					<el-option label="口腔科" value="口腔科" />
					<el-option label="放射科" value="放射科" />
					<el-option label="妇科" value="妇科" />
					<el-option label="男科" value="男科" />
					<el-option label="一般检查室" value="一般检查室" />
					<el-option label="动脉硬化检测室" value="动脉硬化检测室" />
					<el-option label="心电图室" value="心电图室" />
					<el-option label="采血室" value="采血室" />
					<el-option label="尿常规室" value="尿常规室" />
					<el-option label="超声检查室" value="超声检查室" />
					<el-option label="骨密度检查室" value="骨密度检查室" />
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialog.visible = false">取消</el-button>
				<el-button type="primary" @click="dialog.visible = false">确定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
	import { reactive, getCurrentInstance, ref } from "vue";
	import { ElMessageBox } from 'element-plus'
	import { dayjs } from 'element-plus'
	import { isBlank } from "../../utils/validate";

	const { proxy } = getCurrentInstance();

	const data = reactive({
		dataForm: {
			place: null,
			uuid: null,
			checkup: [],
			template: null
		},
		customer: {
			name: "<无>",
			sex: "<无>",
			age: "<无>",
			tel: "<无>",
			uuid: "<无>",
			date: null
		},
		doctor: {
			name: null,
			sex: null,
			tel: null,
			date: new Date().toLocaleDateString()
		},
	});

	document.onkeyup = function (e) {
		if (e.key == "F4") {
			proxy.$refs.uuid.focus();
			data.dataForm.uuid = null;
		}
	};

	function loadDoctorSummary() {
		proxy.$http('/mis/user/searchDoctorById', 'GET', {}, true, function (resp) {
			let result = resp.result;
			data.doctor.name = result.name;
			data.doctor.sex = result.sex;
			data.doctor.tel = result.tel;
		});
	}
	loadDoctorSummary();

	const dialog = reactive({
		visible: false,
		dataRule: {
			place: [{ required: true, message: "没有选择科室" }],
		},
	});

	function selectDeptHandle() {
		dialog.visible = true;
	}

	function changePlaceHandle() {
		clearData();
	}

	function clearData() {
		//清空体检人信息
		data.customer.name = "<无>"
		data.customer.sex = "<无>"
		data.customer.tel = "<无>"
		data.customer.age = "<无>"
		data.customer.uuid = "<无>"
		data.customer.date = null

		//清空体检项
		data.dataForm.uuid = null;
		data.dataForm.checkup = []

		//文本框自动获得焦点
		proxy.$refs.uuid.focus();
	}

	function searchHandle() {
		if (isBlank(data.dataForm.place)) {
			proxy.$message({
				message: '请先选择科室',
				type: 'error',
				duration: 1200
			});
		} else if (data.dataForm.uuid == null || data.dataForm.uuid == "") {
			proxy.$message({
				message: '请输入体检编号',
				type: 'error',
				duration: 1200
			});
		} else if (/^[0-9a-zA-Z]{32}$/.test(data.dataForm.uuid) == false) {
			proxy.$message({
				message: '体检编号不正确',
				type: 'error',
				duration: 1200
			});
		} else {
			let json = { uuid: data.dataForm.uuid };
			proxy.$http('/mis/appointment/searchByUuid', "POST", json, true, function (resp) {
				let result = resp.result
				data.customer.name = result.name
				data.customer.sex = result.sex
				data.customer.tel = result.tel
				data.customer.age = result.age
				data.customer.uuid = result.uuid
				data.customer.date = result.date
				if (data.customer.date != dayjs().format("YYYY-MM-DD")) {
					proxy.$refs.uuid.blur();
					ElMessageBox.confirm('不是今日的体检，是否要执行体检？', '提示信息', {
						confirmButtonText: '执行',
						cancelButtonText: '拒绝',
						type: 'error',
					}).then(() => {
						loadCheckup()
					})
						.catch(() => {
							clearData()
						})
				} else {
					loadCheckup()
				}
			});
		}
	}

	function loadCheckup() {
		let json = { uuid: data.dataForm.uuid, place: data.dataForm.place };
		proxy.$http('/mis/checkup/searchCheckupByPlace', "POST", json, true, function (resp) {
			let result = resp.result
			//判断该科室是否录入了体检结果
			if (result.hasAlreadyCheckup) {
				ElMessageBox.confirm('该体检套餐已经存在当前科室的检查结果，是否重新执行检查？', '提示信息', {
					confirmButtonText: '执行',
					cancelButtonText: '拒绝',
					type: 'warning',
				}).then(() => {
					for (let one of result.checkupList) {
						//给每个元素添加input属性，与选择什么预设值有关
						one.input = { select: null, value: null };
						//判断预设值是“无”的情况
						if (one.value == "无") {
							one.value = ["其他"];//列表项内容为“其他”
							one.input.select = "其他";//设置列表选中内容
						} else {
							one.value = one.value.split("#")//切分预设值形成数组
						}
						data.dataForm.template = one.template//提交体检结果的时候需要提交输入模板种类，该模板与生成提交报告有关
					}
					data.dataForm.checkup = result.checkupList
				})
					.catch(() => {
						clearData()
					})
			} else {
				for (let one of result.checkupList) {
					one.input = { select: null, value: null }
					if (one.value == "无") {
						one.value = ["其他"]
						one.input.select = "其他"
					} else {
						one.value = one.value.split("#")
					}
					data.dataForm.template = one.template
				}
				data.dataForm.checkup = result.checkupList
			}
		});
	}

	function clearCheckupHandle() {
		for (let one of data.dataForm.checkup) {
			if (one.value.length == 1) {
				one.input = {select: "其他", value: null }
			} else {
				one.input = { select: null, value: null }
			}
		}
	}

	function dataFormSubmit() {
		let flag = false;
		let item = []
		for (let one of data.dataForm.checkup) {
			let input = one.input
			let select = input.select
			let value = input.value
			if (isBlank(select) || (select == "其他" && isBlank(value))) {
				flag = true;
				break;
			}
			let temp = { "name": one.item, "unit": one.unit, "standard": one.standard }
			if (input.select == "其他") {
				temp.value = value;
			} else {
				temp.value = select;
			}
			item.push(temp)
		}
		if (flag) {
			proxy.$message({
				message: '存在未输入的检查结果',
				type: 'error',
				duration: 1200
			});
			return
		}
		let json = { name: data.doctor.name, uuid: data.dataForm.uuid, place: data.dataForm.place, template: data.dataForm.template, item: item }
		proxy.$http('/mis/checkup/addResult', "POST", json, true, function (resp) {
			proxy.$message({
				message: '提交成功',
				type: 'success',
				duration: 1200,
				onClose: () => {
					clearData();
				}
			});
		});
	}
</script>
<style lang="less" scoped>
	@import url('doctor_checkup.less');
</style>