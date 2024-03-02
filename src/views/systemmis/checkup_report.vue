<template>
	<div v-if="proxy.isAuth(['ROOT', 'CHECKUP_REPORT:SELECT'])">
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
			<el-form-item prop="name">
				<el-input v-model="dataForm.name" placeholder="姓名" maxlength="20" class="input" clearable="clearable" />
			</el-form-item>
			<el-form-item prop="tel">
				<el-input v-model="dataForm.tel" placeholder="电话号码" maxlength="11" class="input"
					clearable="clearable" />
			</el-form-item>
			<el-form-item prop="waybillCode">
				<el-input v-model="dataForm.waybillCode" placeholder="快递单号" maxlength="24" class="input"
					clearable="clearable" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="searchHandle()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-upload :action="upload.action" name="file" accept=".xlsx" headers="upload.headers"
					:show-file-list="false" :on-success="excelUploadSuccess" :on-error="excelUploadError">
					<el-button type="primary">导入运单</el-button>
				</el-upload>
			</el-form-item>
			<el-form-item class="mold">
				<el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
					<el-radio-button label="全部"></el-radio-button>
					<el-radio-button label="未生成"></el-radio-button>
					<el-radio-button label="已生成"></el-radio-button>
					<el-radio-button label="已寄出"></el-radio-button>
				</el-radio-group>
			</el-form-item>
		</el-form>
		<el-table :data="data.dataList" :header-cell-style="{'background': '#f5f7fa'}" border v-loading="data.loading">
			<el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
				<template #default="scope">
					<span>{{ (data.pageIndex - 1) * data.pageSize + scope.$index + 1}}</span>
				</template>
			</el-table-column>
			<el-table-column header-align="center" align="center" label="姓名" min-width="150" fixed>
				<template #default="scope">
					<span class="customer-name"
						@dblclick="copyAddressHandle(scope.row.name, scope.row.tel, scope.row.mailingAddress)">{{scope.row.name}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="sex" header-align="center" align="center" label="性别" width="130">

			</el-table-column>
			<el-table-column prop="age" header-align="center" align="center" label="年龄" width="130">

			</el-table-column>
			<el-table-column prop="hideTel" header-align="center" align="center" label="电话" width="180">

			</el-table-column>
			<el-table-column prop="status" header-align="center" align="center" label="报告状态" width="140">

			</el-table-column>
			<el-table-column prop="waybillCode" header-align="center" align="center" label="快递单号" width="280">

			</el-table-column>
			<el-table-column prop="waybillDate" header-align="center" align="center" label="寄出日期" width="170">

			</el-table-column>
			<el-table-column fixed="right" header-align="center" align="center" width="250" label="操作">
				<template #default="scope">
					<el-button type="text" :disabled="scope.row.disabled" @click="createReportHandle(scope.row.id)">
						生成报告</el-button>
					<el-button type="text" :disabled="scope.row.status!='已生成'"
						@click="downloadReportHandle(scope.row.name, scope.row.filePath)">
						下载报告</el-button>
					<el-button type="text" :disabled="scope.row.status!='已生成'"
						@click="identifyWaybillHandle(scope.row.id, scope.row.name, scope.row.tel)">
						录入运单</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
		</el-pagination>
	</div>
	<el-dialog title="录入运单" v-if="proxy.isAuth(['ROOT', 'CURRENT_REPORT:UPDATE'])" :close-on-click-modal="false"
		v-model="dialog.visible" width="420px">
		<el-alert title="请上传快递运单照片，系统将自动识别运单中的信息，然后请您核对无误后，提交运单信息" type="success" :closable="false" />
		<el-upload :action="dialog.upload.action" name="file" accept=".jpg,.jpeg" :headers="dialog.upload.headers"
			:show-file-list="false" :before-upload="waybillBeforeUpload" :on-success="waybillUploadSuccess"
			:onerror="waybillUploadError">
			<el-button type="primary">上传运单</el-button>
		</el-upload>
		<el-divider border-style="dashed">认真核对下方运单信息</el-divider>
		<table class="waybill-table">
			<tr>
				<th>收件人姓名：</th>
				<td>{{dialog.data.recName}}</td>
			</tr>
			<tr>
				<th>收件人电话：</th>
				<td>{{dialog.data.recTel}}</td>
			</tr>
			<tr>
				<th>运单号码：</th>
				<td>{{dialog.data.waybillCode}}</td>
			</tr>
		</table>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="dialog.visible=false">取消</el-button>
				<el-button type="primary"
					:disabled="dialog.data.waybillCode==null||dialog.data.name!=dialog.data.recName||dialog.data.recTel.substr(7, 4)!=dialog.data.telEnd"
					@click="dataFormSubmit">提交运单</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
	import { reactive, getCurrentInstance, ref } from 'vue';
	import { ElNotification } from 'element-plus'
	import { isBlank } from "../../utils/validate";
	import { dayjs } from 'element-plus'
	import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
	dayjs.extend(isSameOrBefore)

	const { proxy } = getCurrentInstance();

	const dataForm = reactive({
		name: null,
		tel: null,
		waybillCode: null,
		statusLabel: '全部',
		status: null
	});

	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false
	});

	const dataRule = reactive({
		name: [
			{ required: false, pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误' }
		],
		tel: [
			{ required: false, pattern: '^1[1-9]\\d{9}$', message: '电话格式错误' }
		],
		waybillCode: [
			{ required: false, pattern: '^[0-9a-zA-Z]{10,24}$', message: '快递单号格式错误' }
		]
	});

	const upload = reactive({
		action: `${proxy.$baseUrl}/mis/checkup/report/importWayBills`,
		headers: {
			"token": localStorage.getItem('token')
		},
	});

	const dialog = reactive({
		visible: false,
		upload: {
			action: `${proxy.$baseUrl}/mis/checkup/report/identifyWaybill`,
			headers: {
				"token": localStorage.getItem('token')
			},
			data: { id: null }
		},
		data: {
			id: null,
			recName: null,
			recTel: null,
			waybillCode: null,
			name: null,
			telEnd: null
		}
	})
</script>

<style lang="less" scoped>
	@import url('checkup_report.less');
</style>