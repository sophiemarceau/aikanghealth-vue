<template>
	<div v-if="proxy.isAuth(['ROOT', 'GOODS:SELECT'])">
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
			<el-form-item prop="keyword">
				<el-input v-model="dataForm.keyword" placeholder="套餐名称" maxlength="50" class="input"
					clearable="clearable"></el-input>
			</el-form-item>
			<el-form-item prop="code">
				<el-input v-model="dataForm.code" placeholder="套餐编号" class="input" maxlength="20"
					clearable="clearable"></el-input>
			</el-form-item>
			<el-form-item>
				<el-select v-model="dataForm.type" class="input" placeholder="类别" clearable="clearable">
					<el-option label="父母体检" value="父母体检"></el-option>
					<el-option label="入职体检" value="入职体检"></el-option>
					<el-option label="职场白领" value="职场白领"></el-option>
					<el-option label="个人高端" value="个人高端"></el-option>
					<el-option label="中青年体检" value="中青年体检"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item>
				<el-select v-model="dataForm.partId" class="input" placeholder="展示区" clearable="clearable">
					<el-option label="活动专区" value="1"></el-option>
					<el-option label="热卖套餐" value="2"></el-option>
					<el-option label="新品推荐" value="3"></el-option>
					<el-option label="孝敬父母" value="4"></el-option>
					<el-option label="白领精英" value="5"></el-option>
				</el-select>
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="searchHandle()">查询</el-button>
				<el-button type="primary" :disabled="!proxy.isAuth(['ROOT', 'GOODS:INSERT'])"
					@click="addHandle()">新增</el-button>
				<el-button type="danger" :disabled="!proxy.isAuth(['ROOT', 'GOODS:DELETE'])"
					@click="deleteHandle()">批量删除</el-button>
			</el-form-item>
			<el-form-item class="mold">
				<el-radio-group v-model="dataForm.statusLabel" @change="searchHandle()">
					<el-radio-button label="全部"></el-radio-button>
					<el-radio-button label="已上架"></el-radio-button>
					<el-radio-button label="已下架"></el-radio-button>
				</el-radio-group>
			</el-form-item>
		</el-form>

		<el-table :data="data.dataList" :header-cell-style="{'background':'#f5f7fa'}" border v-loading="data.loading"
			@selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"
				:selectable="selectable"></el-table-column>
			<el-table-column prop="title" header-align="left" align="left" min-width="250"
				label="套餐名称"></el-table-column>
			<el-table-column prop="code" header-align="left" align="left" min-width="130"
				label="套餐编号"></el-table-column>
			<el-table-column header-align="center" align="center" min-width="80" label="现价">
				<template #default="scope">
					<span>￥{{scope.row.currentPrice}}</span>
				</template>
			</el-table-column>
			<el-table-column header-align="center" align="center" min-width="100" label="原价">
				<template #default="scope">
					<span>￥{{scope.row.initialPrice}}</span>
				</template>
			</el-table-column>
			<el-table-column prop="ruleName" header-align="center" align="center" min-width="100"
				label="促销方案"></el-table-column>
			<el-table-column prop="salesVolume" header-align="center" align="center" min-width="100"
				label="销量"></el-table-column>
			<el-table-column prop="type" header-align="center" align="center" min-width="100"
				label="类型"></el-table-column>
			<el-table-column header-align="center" align="center" min-width="100" label="体检内容">
				<template #default="scope">
					<span :class="scope.row.hasCheckup ? 'link-blue' : 'link-red'"
						@click="documentHandle(scope.row.id, scope.row.hasCheckup)">
						{{scope.row.hasCheckup ? '有文档' : '无文档'}}
					</span>
				</template>
			</el-table-column>
			<el-table-column prop="status" header-align="center" align="center" min-width="80" label="状态">
				<template #default="scope">
					<el-switch v-model="scope.row.status" inline-prompt
						style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;" active-text="上架"
						inactive-text="下架" :disabled="!scope.row.hasCheckup"
						@change="changeSwitchHandle(scope.row.id, scope.row.status)"></el-switch>
				</template>
			</el-table-column>
			<el-table-column header-align="center" align="center" width="150" label="操作">
				<template #default="scope">
					<el-button type="text" :disabled="!scope.row.status"
						@click="viewHandle(scope.row.id)">预览</el-button>
					<el-button type="text" v-if="proxy.isAuth(['ROOT', 'GOODS:UPDATE'])" :disabled="scope.row.status"
						@click="updateHandle(scope.row.id)">修改</el-button>
					<el-button type="text" v-if="proxy.isAuth(['ROOT', 'GOODS:DELETE'])"
						:disabled="scope.row.salesVolumn > 0 || scope.row.status" @click="deleteHandle(scope.row.id)">
						删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
	</div>



	<el-dialog :title="!goodsDialog.dataForm.id ? '新增' : '修改'"
		v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])" :close-on-click-modal="false"
		v-model="goodsDialog.visible" width="750px">
		<el-form :model="goodsDialog.dataForm" ref="dialogForm" :rules="goodsDialog.dataRule" label-width="80px">
			<el-form-item label="套餐名称" prop="title">
				<el-input v-model="goodsDialog.dataForm.title" maxlength="50" clearable></el-input>
			</el-form-item>
			<el-form-item label="套餐编号" prop="code">
				<el-input v-model="goodsDialog.dataForm.code" maxlength="20" clearable></el-input>
			</el-form-item>
			<el-form-item label="简介信息" prop="description">
				<el-input type="textarea" v-model="goodsDialog.dataForm.description" :rows="4" maxlength="200"
					clearable></el-input>
			</el-form-item>
			<el-form-item label="套餐原价" prop="initialPrice">
				<el-input v-model="goodsDialog.dataForm.initialPrice" placeholder="输入原价" class="price" maxlength="20"
					clearable>
					<template #append>元</template>
				</el-input>
				<span class="desc">提示：价格精确到分（小数点后2位）</span>
			</el-form-item>
			<el-form-item label="套餐现价" prop="currentPrice">
				<el-input v-model="goodsDialog.dataForm.currentPrice" placeholder="输入现价" class="price" maxlength="20"
					clearable>
					<template #append>元</template>
				</el-input>
				<span class="desc">提示：价格精确到分（小数点后2位）</span>
			</el-form-item>
			<el-form-item label="折扣列表">
				<el-select v-model="goodsDialog.dataForm.ruleId" placeholder="选择折扣信息" clearable="clearable">
					<el-option :label="one.name" :value="one.id" v-for="one in goodsDialog.ruleList"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="封面图片" prop="image">
				<el-upload class="image-uploader" :action="goodsDialog.upload.action"
					:headers="goodsDialog.upload.headers" :data="goodsDialog.upload.data" :show-file-list="false"
					accept=".jpg,.jpeg" :on-success="imageUploadSuccess" :before-upload="imageBeforeUpload"
					:on-error="imageUploadError">
					<img v-if="goodsDialog.imageUrl" :src="goodsDialog.imageUrl" class="image" />
					<el-icon v-else class="image-uploader-icon">
						<Plus />
					</el-icon>
				</el-upload>
			</el-form-item>
			<el-form-item label="套餐类别" prop="type">
				<el-select v-model="goodsDialog.dataForm.type" placeholder="检查类别" clearable="clearable">
					<el-option label="父母体检" value="父母体检" />
					<el-option label="入职体检" value="入职体检" />
					<el-option label="职场白领" value="职场白领" />
					<el-option label="个人高端" value="个人高端" />
					<el-option label="中青年体检" value="中青年体检" />
				</el-select>
			</el-form-item>
			<el-form-item label="特征标签">
				<div class="tag-row">
					<el-input class="tag-input" v-model="goodsDialog.newTag" @keyup.enter="enterTag" clearable />
					<span class="desc">提示：输入标签后按回车键</span>
				</div>
				<div class="tags">
					<el-tag v-for="one in goodsDialog.dataForm.tag" closable :disable-transitions="false"
						@close="closeTag(one)">{{one}}</el-tag>
				</div>
			</el-form-item>
			<el-form-item label="展示区" prop="partId">
				<el-select v-model="goodsDialog.dataForm.partId" placeholder="选择展示区" clearable="clearable">
					<el-option label="活动专区" value="1" />
					<el-option label="热卖套餐" value="2" />
					<el-option label="新品推荐" value="3" />
					<el-option label="孝敬父母" value="4" />
					<el-option label="白领精英" value="5" />
				</el-select>
			</el-form-item>
			<el-form-item label="体检内容">
				<el-row :gutter="10" class="item-row" v-for="(one, $index) in goodsDialog.item" :key="$index">
					{{i}}
					<el-col :span="6">
						<el-select v-model="one.type" placeholder="检查类别" clearable="clearable">
							<el-option label="科室检查" value="科室检查" />
							<el-option label="实验室检查" value="实验室检查" />
							<el-option label="医技检查" value="医技检查" />
							<el-option label="其他检查" value="其他检查" />
						</el-select>
					</el-col>

					<el-col :span="6">
						<el-input v-model="one.title" placeholder="体检项目" maxlength="50" clearable>
						</el-input>
					</el-col>

					<el-col :span="11">
						<el-input v-model="one.content" placeholder="体检内容" maxlength="500" clearable>
						</el-input>
					</el-col>

					<el-col :span="1">
						<el-button type="primary" :icon="Delete" @click="deleteItem($index)">
						</el-button>
					</el-col>
				</el-row>
			</el-form-item>
		</el-form>
		<template #footer>
			<span class="dialog-footer">
				<el-button type="danger" @click="addItem">添加项目</el-button>
				<el-button @click="goodsDialog.visible=false">取消</el-button>
				<el-button type="primary" @click="dataFormSubmit">确定</el-button>
			</span>
		</template>
	</el-dialog>

	<el-dialog title="提示信息" v-if="proxy.isAuth(['ROOT', 'GOODS:INSERT', 'GOODS:UPDATE'])"
		v-model="documentDialog.visible" width="350px">
		<div class="message-content">
			<el-icon :size="18" class="icon">
				<WarningFilled />
			</el-icon>
			<p>请您选择【上传】或者【下载】体检内容文档？如果未上传体检内容文档，则体检套餐将无法上架。</p>
		</div>
		<template #footer>
			<span class="document-dialog-footer">
				<el-upload :action="documentDialog.upload.action" :data="documentDialog.data" :show-file-list="false"
					:headers="documentDialog.upload.headers" accept=".xlsx" :before-upload="documentBeforeUpload"
					:on-success="documentUploadSuccess" :on-error="documentUploadError">
					<el-button type="success" :icon="Upload" class="uploadBtn">上传</el-button>
				</el-upload>
				<el-button type="primary" :icon="Download" class="downloadBtn"
					:disabled="!documentDialog.data.hasCheckup" @click="documentDownloadHandle">
					下载
				</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
	import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
	//引入elementplus 组件库中的3个图标，要给按钮设置图标
	import { Delete, Download, Upload } from '@element-plus/icons-vue';
	import router from '../../router/index';
	const { proxy } = getCurrentInstance();

	const dataForm = reactive({
		keyword: null,
		code: null,
		type: null,
		partId: null,
		statusLabel: '全部',
		status: null
	});

	const dataRule = reactive({
		keyword: [{ pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{1,50}$', message: '关键字内容不正确' }],
		code: [{ min: 6, message: '编号不能少于6个字符' }, { pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }]
	});

	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false,
		selections: []
	})

	const goodsDialog = reactive({
		visible: false,
		newTag: null,
		item: [{}],
		imageUrl: null,
		checkup: null,
		ruleList: [],
		dataForm: {
			id: null,
			title: null,
			code: null,
			description: null,
			initialPrice: null,
			currentPrice: null,
			ruleId: null,
			image: null,
			type: null,
			tag: [],
			partId: null,
		},
		upload: {
			action: `${proxy.$baseUrl}/mis/goods/uploadImage`,
			headers: {
				token: localStorage.getItem('token')
			},
			data: {
				id: null
			},
		},
		dataRule: {
			title: [
				{ required: true, message: '名称不能为空' },
				{ min: 2, message: '名称不能少于2个字符' },
				{ pattern: '^[a-zA-Z0-9\u4e00-\u9fa5]{2,50}$', message: '名称格式错误' }
			],
			code: [
				{ required: true, message: '编号不能为空' },
				{ min: 6, message: '编号不能少于6个字符' },
				{ pattern: '^[a-zA-Z0-9]{6,20}$', message: '编号格式错误' }
			],
			description: [{ required: true, message: '简介信息不能为空' }],
			initialPrice: [
				{
					required: true,
					message: '价格不能为空'
				},
				{
					pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
					message: '价格不正确'
				}
			],
			currentPrice: [
				{
					required: true,
					message: '价格不能为空'
				},
				{
					pattern: '(^[1-9]([0-9]+)?(\\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\\.[0-9]([0-9])?$)',
					message: '价格不正确'
				}
			],
			image: [
				{
					required: true,
					message: '没有上传封面图片'
				}
			],
			type: [
				{
					required: true,
					message: '没有选择套餐类别'
				}
			]
		}
	});

	const documentDialog = reactive({
		visible: false,
		upload: {
			action: `${proxy.$baseUrl}/mis/goods/uploadCheckupExcel`,
			headers: {
				token: localStorage.getItem('token')
			}
		},
		data: {
			id: null,
			hasCheckup: null
		}
	});

	function loadDataList() {
		data.loading = true;
		if (dataForm.statusLabel == "全部") {
			dataForm.status = null;
		} else if (dataForm.statusLabel == "已上架") {
			dataForm.status = true;
		} else {
			dataForm.status = false;
		}
		let json = {
			page: data.pageIndex,
			length: data.pageSize,
			keyword: dataForm.keyword,
			code: dataForm.code,
			type: dataForm.type,
			partId: dataForm.partId,
			status: dataForm.status
		};
		proxy.$http('/mis/goods/searchByPage', 'POST', json, true, function (resp) {
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
				if (dataForm.keyword == '') {
					dataForm.keyword = null;
				}
				if (dataForm.code == '') {
					dataForm.code = null;
				}
				if (dataForm.type == '') {
					dataForm.type = null;
				}
				if (dataForm.partId == '') {
					dataForm.partId = null;
				}
				if (dataForm.pageIndex != 1) {
					data.pageIndex = 1;
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

	function imageBeforeUpload(file) {
		let size = file.size / 1024 / 1024;
		if (size > 2) {
			proxy.$message({
				message: '图片不能超过2M大小',
				type: 'error',
				duration: 1200
			});
			return false;
		}
		return true;
	}

	function imageUploadSuccess(resp : any, uploadFile : UploadFile, uploadFiles : UploadFiles) {
		if (resp.msg == 'success') {
			let path = resp.result;
			//保存图片相对地址，添加或者修改商品的时候，要上传给后端web方法
			goodsDialog.dataForm.image = path;
			//上传控件中显示已上传的图片
			goodsDialog.imageUrl = `${proxy.$minioUrl}/${path}`;
			console.log(goodsDialog.imageUrl);
		}
	}

	function imageUploadError(e) {
		proxy.$message({
			message: '图片上传失败',
			type: 'error',
			duration: 1200
		});
		console.error(e);
	}

	function addHandle() {
		//添加新商品id和上传图片相关属性要置空
		goodsDialog.dataForm.id = null;
		goodsDialog.dataForm.image = null;
		goodsDialog.imageUrl = null;

		goodsDialog.dataForm.ruleId = null;
		goodsDialog.ruleList = [];

		goodsDialog.item = [{}];

		goodsDialog.checkup = null;

		goodsDialog.newTag = null;
		goodsDialog.dataForm.tag = [];

		goodsDialog.visible = true;
		proxy.$nextTick(() => {
			proxy.$refs['dialogForm'].resetFields();
			loadAllRule();
		});
	}

	function loadAllRule() {
		proxy.$http('/mis/rule/searchAllRule', 'GET', null, true, function (resp) {
			goodsDialog.ruleList = resp.result;
		});
	}

	function enterTag() {
		//输入内容空值或空字符串
		if (goodsDialog.newTag != null && goodsDialog.newTag != '') {
			//相同元素 已经还有不需要创建新tag标签
			if (goodsDialog.dataForm.tag.includes(goodsDialog.newTag)) {
				proxy.$message({
					message: '不能添加重复标签',
					type: 'warning',
					duration: 1200
				});
			} else {
				goodsDialog.dataForm.tag.push(goodsDialog.newTag);
				goodsDialog.newTag = null;
			}
		}
	}

	function closeTag(tag) {
		//根据内容 取出数字里的位置
		let i = goodsDialog.dataForm.tag.indexOf(tag);
		//根据位置删除数组里的对应元素
		goodsDialog.dataForm.tag.splice(i, 1);
	}

	function addItem() {
		goodsDialog.item.push({});
	}

	function deleteItem(index) {
		if (goodsDialog.item.length == 1) {
			proxy.$message({
				message: '不能删除仅存的体检内容',
				type: 'warning',
				duration: 1200
			});
		} else {
			goodsDialog.item.splice(index, 1);
		}
	}

	function dataFormSubmit() {
		proxy.$refs['dialogForm'].validate(valid => {
			if (valid) {//前端验证通过后 进入
				let temp = {};
				for (let one of goodsDialog.item) {
					if (one.type == undefined || one.type == '') {
						proxy.$message({
							message: '没有选择检查类别',
							type: 'warning',
							duration: 1200
						});
						return
					}
					if (one.title == undefined || one.title == '') {
						proxy.$message({
							message: '存在没有填写的体检项目',
							type: 'warning',
							duration: 1200
						});
						return
					}
					if (one.content == undefined || one.content == '') {
						proxy.$message({
							message: '存在没有填写的体检内容',
							type: 'warning',
							duration: 1200
						});
						return
					}
					let typeJson = {
						科室检查: 'checkup_1',
						实验室检查: 'checkup_2',
						医技检查: 'checkup_3',
						其他检查: 'checkup_4'
					};
					let type = typeJson[one.type];
					if (!temp.hasOwnProperty(type)) {
						temp[type] = [{ title: one.title, content: one.content }];
					} else {
						temp[type].push({ title: one.title, content: one.content });
					}
				}
				//检查JSON对象中是否包含checkup_1 到checkup4 这四个属性，缺哪个就添加哪个属性
				['checkup_1', 'checkup_2', 'checkup_3', 'checkup_4'].forEach(function (one) {
					if (!temp.hasOwnProperty(one)) {
						temp[one] = null;
					}
				});
				goodsDialog.checkup = temp;
				let tag = goodsDialog.dataForm.tag;
				let json = {
					id: goodsDialog.dataForm.id,
					title: goodsDialog.dataForm.title,
					code: goodsDialog.dataForm.code,
					description: goodsDialog.dataForm.description,
					checkup_1: goodsDialog.checkup.checkup_1,
					checkup_2: goodsDialog.checkup.checkup_2,
					checkup_3: goodsDialog.checkup.checkup_3,
					checkup_4: goodsDialog.checkup.checkup_4,
					initialPrice: goodsDialog.dataForm.initialPrice,
					currentPrice: goodsDialog.dataForm.currentPrice,
					ruleId: goodsDialog.dataForm.ruleId == '' ? null : goodsDialog.dataForm.ruleId,
					image: goodsDialog.dataForm.image,
					type: goodsDialog.dataForm.type,
					partId: goodsDialog.dataForm.partId,
					tag: tag != null && tag.length > 0 ? tag : null
				};

				proxy.$http(`/mis/goods/${goodsDialog.dataForm.id == null ? 'insert' : 'update'}`, 'POST', json, true,
					function (resp) {
						if (resp.rows == 1) {
							proxy.$message({
								message: '操作成功',
								type: 'success',
								duration: 1200
							});
							goodsDialog.visible = false;
							loadDataList();
						} else {
							proxy.$message({
								message: '操作失败',
								type: 'error',
								duration: 1200
							});
						}
					}
				);
			}
		});
	}

	function updateHandle(id) {
		goodsDialog.upload.data.id = id;
		goodsDialog.dataForm.id = id;
		goodsDialog.dataForm.image = null;
		goodsDialog.imageUrl = null;
		goodsDialog.item = [];
		goodsDialog.checkup = null;
		goodsDialog.newTag = null;
		goodsDialog.dataForm.tag = [];
		goodsDialog.visible = true;

		proxy.$nextTick(() => {
			proxy.$refs['dialogForm'].resetFields();
			let json = { id: id };
			loadAllRule();
			proxy.$http('/mis/goods/searchById', 'POST', json, true, function (resp) {
				let result = resp.result;
				goodsDialog.dataForm.code = resp.result.code;
				goodsDialog.dataForm.title = resp.result.title;
				goodsDialog.dataForm.description = resp.result.description;
				goodsDialog.dataForm.image = resp.result.image;
				goodsDialog.imageUrl = `${proxy.$minioUrl}/${resp.result.image}`;
				goodsDialog.dataForm.initialPrice = resp.result.initialPrice;
				goodsDialog.dataForm.currentPrice = resp.result.currentPrice;
				goodsDialog.dataForm.type = resp.result.type;
				goodsDialog.dataForm.tag = resp.result.hasOwnProperty('tag') ? resp.result.tag : [];
				goodsDialog.dataForm.partId = resp.result.partId + "";
				goodsDialog.dataForm.ruleId = resp.result.ruleId;
				let typeJson = {
					checkup_1: '科室检查',
					checkup_2: '实验室检查',
					checkup_3: '医技检查',
					checkup_4: '其他检查2'
				};
				for (let key in typeJson) {
					if (resp.result.hasOwnProperty(key)) {
						let checkup = resp.result[key];
						for (let one of checkup) {
							goodsDialog.item.push({ type: typeJson[key], title: one.title, content: one.content });

						}
					}
				}
			});
		});
	}

	function documentHandle(id, hasCheckup) {
		documentDialog.data = {
			id: id,
			hasCheckup: hasCheckup
		};
		documentDialog.visible = true;
	}

	function documentBeforeUpload(file) {
		let size = file.size / 1024 / 1024;
		if (size > 20) {
			proxy.$message({
				message: '文件不能超过20M大小',
				type: 'error',
				duration: 1200
			});
			return false;
		}
		return true;
	}

	function documentUploadSuccess() {
		console.log(documentUploadSuccess);
		documentDialog.visible = false;
		proxy.$message({
			message: '文件上传成功',
			type: 'success',
			duration: 1200,
			onClose: () => {
				loadDataList();
			}
		});
	}

	function documentUploadError(e) {
		proxy.$message({
			message: '文件上传失败',
			type: 'error',
			duration: 1200
		});
		console.error(e);
	}

	function documentDownloadHandle() {
		let token = localStorage.getItem('token');
		let id = documentDialog.data.id
		let url = `${proxy.$baseUrl}/mis/goods/downloadCheckupExcel?token=${token}&id=${id}`;
		//创建超链接对象
		let a = document.createElement('a');
		//设置超连接地址
		a.href = url;
		//利用超连接发出get请求
		a.click();
		//1 秒钟后关闭弹窗控件
		setTimeout(function () {
			documentDialog.visible = false;
		});
	}

	function changeSwitchHandle(id, bool) {
		let json = { id: id, status: bool };
		proxy.$http('/mis/goods/updateStatus', 'POST', json, true, function (resp) {
			if (resp.result) {
				proxy.$message({
					message: '操作成功',
					type: 'success',
					duration: 1200
				});
			}
		});
	}

	function selectionChangeHandle(val) {
		data.selections = val;
	}

	function deleteHandle(id) {
		let ids = id ? [id] : data.selections.map(item => {
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
				confirmButtionText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let json = { ids: ids };
				proxy.$http('/mis/goods/deleteByIds', 'POST', json, true, function (resp) {
					if (resp.rows > 0) {
						proxy.$message({
							message: `删除了${resp.rows}条记录`,
							type: 'success',
							duration: 1200,
							onClose: () => {
								loadDataList();
							}
						});
					} else {
						proxy.$message({
							message: '未能删除记录',
							type: 'warning',
							duration: 1200,
						});
					}
				});
			})
		}
	}

	function viewHandle(id) {
		router.push({
			name: 'FrontGoods',
			params: {
				id: id
			}
		});
	}
	
	function selectable(row, index) {
		if (row.saleVolume > 0 || row.status == true) {
			return false;
		} 
		return true;
	}
</script>

<style lang="less" scoped>
	@import url('goods.less');
</style>