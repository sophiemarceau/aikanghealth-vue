<template>
	<div v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])">
		<el-form :inline="true" :model="dataForm" :rules="dataRule" ref="form">
			<el-form-item>
				<el-date-picker v-model="dataForm.date" type="date" placeholder="选择日期" :editable="false"
					format="YYYY-MM-DD" value-format="YYYY-MM-DD" :clearable="false" />
			</el-form-item>
			<el-form-item prop="name">
				<el-input v-model="dataForm.name" placeholder="姓名" maxlength="10" class="input"
					clearable="clearable"></el-input>
			</el-form-item>
			<el-form-item prop="tel">
				<el-input v-model="dataForm.tel" placeholder="电话号码" maxlength="11" class="input"
					clearable="clearable"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="searchHandle()">查询</el-button>
				<el-button type="success" @click="checkinHandle()">体检签到</el-button>
				<el-button type="danger" @click="finishHandle()">完成体检</el-button>
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
		<el-table :data="data.dataList" :header-cell-style="{'background': 'f5f7fa'}" border v-loading="data.loading"
			@selection-change="selectionChangeHandle">
			<el-table-column type="selection" :selectable="selectable" header-align="center" align="center" width="50"
				fixed />
			<el-table-column type="index" header-align="center" align="center" width="120" label="序号" fixed>
				<template #default="scope">
					<span>{{(data.pageIndex - 1) * data.pageSize + scope.$index + 1}}</span>
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
			<el-table-column fixed="right" header-align="center" align="center" label="操作" width="150">
				<template #default="scope">
					<el-button type="text" :disabled="!proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])"
						@click="guidanceHandle(scope.row.id)">导引单</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle"
			:current-page="data.pageIndex" :page-sizes="[10, 20, 50]" :page-size="data.pageSize"
			:total="data.totalCount" layout="total, sizes, prev, pager, next, jumper">
		</el-pagination>
		<el-dialog title="体检签到" v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:UPDATE'])" :close-on-click-modal="false"
			v-model="checkinDialog.visible" width="500px" :before-close="closeHandle">
			<div class="card-info">
				<div class="left">
					<el-form :model="checkinDialog.dataForm" ref="dialogForm" label-width="60px">
						<el-form-item label="姓名">
							<el-input v-model="checkinDialog.dataForm.name" disabled />
						</el-form-item>
						<el-form-item label="性别">
							<el-input v-model="checkinDialog.dataForm.sex" disabled />
						</el-form-item>
						<el-form-item label="身份证">
							<el-input v-model="checkinDialog.dataForm.pid" disabled />
						</el-form-item>
					</el-form>
				</div>
				<div class="right">
					<img :src="checkinDialog.dataForm.photo_1" class="photo"
						v-if="checkinDialog.dataForm.photo_1 != null" />
					<div class="empty" v-if="checkinDialog.dataForm.photo_1 == null">
						<el-icon :size="60" class="icon">
							<Avatar />
						</el-icon>
					</div>
				</div>
			</div>
			<div class="photo-container">
				<div class="empty" v-show="checkinDialog.showEmpty">
					<SvgIcon name="camera" class="camera" />
					<ol>
						<li>先刷体检人身份证，验证通过后会自动启动摄像头。</li>
						<li>必须要注意拍摄照片中只能有唯一的人脸面部信息，如果存在多张人脸则会报错。</li>
						<li>务必拍摄体检人正脸照片，不可以佩戴墨镜或者遮挡面部的配饰。</li>
					</ol>
				</div>
				<video id="video" autoplay v-show="checkinDialog.showVideo"></video>
				<canvas id="photo" width="460" height="345" v-show="checkinDialog.showPhoto">
				</canvas>
			</div>
			<template #footer>
				<span class="dialog-footer">
					<el-button type="primary" :icon="checkinDialog.btnIcon" :disabled="checkinDialog.showEmpty"
						@click="takePhotoHandle">
						{{ checkinDialog.btnText }}
					</el-button>
					<el-button @click="closeHandle">取消</el-button>
					<el-button type="success"
						:disabled="checkinDialog.dataForm.pid == null || checkinDialog.dataForm.photo_2 == null"
						@click="dataFormSubmit">
						签到
					</el-button>
				</span>
			</template>
		</el-dialog>
		<el-dialog title="体检导引单" v-if="proxy.isAuth(['ROOT', 'APPOINTMENT:SELECT'])" v-model="guidanceDialog.visible"
			width="800px">
			<div class="guidance" id="pdfDom" :name="guidanceDialog.name">
				<h2 class="title">耀莱大健康体检项目导引单</h2>
				<div class="summary">
					<table class="base-info">
						<tr>
							<td class="label">姓名：</td>
							<td class="value">{{guidanceDialog.name}}</td>
							<td class="label">性别：</td>
							<td class="value">{{guidanceDialog.sex}}</td>
							<td class="label">年龄：</td>
							<td class="value">{{guidanceDialog.age}}</td>
						</tr>
						<tr>
							<td class="label">身份证：</td>
							<td class="value">{{guidanceDialog.pid}}</td>
							<td class="label">电话：</td>
							<td class="value">{{guidanceDialog.tel}}</td>
							<td class="label">日期：</td>
							<td class="value">{{guidanceDialog.date}}</td>
						</tr>
						<tr>
							<td class="label">公司：</td>
							<td colspan="5" class="value">
								{{guidanceDialog.company}}
							</td>
						</tr>
					</table>
					<img class="qrCode" :src="guidanceDialog.qrCodeBase64" />
				</div>
				<table class="checkup">
					<tr>
						<th>序号</th>
						<th align="left">检查地址</th>
						<th align="left">检查项目</th>
						<th>体检医生</th>
					</tr>
					<tr v-for="(one, index) in guidanceDialog.checkup">
						<td align="center">{{index + 1}}</td>
						<td>{{one.place}}</td>
						<td>{{one.name}}</td>
						<td></td>
					</tr>
				</table>
				<div class="desc">
					<p>请注意：体检结果10天后，即可在网站(https://github.com/sophiemarceau) 查询到您的体检报告。之后的5个工作日之内，您将收到本体检中心邮寄的体检报告，请留意查收！
					</p>
					<ul>
						<li>
							<el-icon>
								<PhoneFilled />
							</el-icon>
							<span>体检咨询：010-68422288</span>
						</li>
						<li>
							<el-icon>
								<PhoneFilled />
							</el-icon>
							<span>体检咨询：010-68422288</span>
						</li>
						<li>
							<el-icon>
								<PhoneFilled />
							</el-icon>
							<span>体检咨询：010-68422288</span>
						</li>
					</ul>
				</div>
			</div>
			<div class="operate">
				<el-button type="primary" size="large" :icon="Document" @click="getPdf()">下载引导单</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
	import { reactive, getCurrentInstance, ref, onMounted } from 'vue';
	import { ElNotification } from 'element-plus';
	import { Camera, RefreshRight, Document } from '@element-plus/icons-vue';
	import router from '../../router/index';
	import { dayjs } from 'element-plus';
	import isBetween from 'dayjs/plugin/isBetween';

	dayjs.extend(isBetween);

	const { proxy } = getCurrentInstance();

	import imgSrc from '../../assets/login/20240206093518.jpg';

	const returnResult = new URL(imgSrc, import.meta.url).href;

	// 图片转为base64格式
	function imageToBase64(url) {
		return new Promise((resolve, reject) => {
			console.log('qxb1');
			const image = new Image();
			console.log('qxb2');
			image.setAttribute("crossorigin", "anonymous");
			console.log('qxb3');
			image.src = url;
			console.log('qxb4');
			image.onload = () => {
				console.log('qxb5');
				var canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				var context = canvas.getContext("2d");
				context.drawImage(image, 0, 0, image.width, image.height);
				console.log('base64');
				const base64 = canvas.toDataURL("image/jpeg");
				console.log(base64)
				console.log('base65');
				resolve(base64);
			}
		});
	}

	const dataForm = reactive({
		name: null,
		tel: null,
		date: dayjs().format('YYYY-MM-DD'),
		statusLabel: '全部',
		status: null
	});

	const dataRule = reactive({
		name: [{ pattern: '^[\u4e00-\u9fa5]{1,10}$', message: '姓名格式错误' }],
		tel: [{ pattern: '^1[1-9]\\d{9}$', message: '电话号码格式错误' }]
	});

	const data = reactive({
		dataList: [],
		pageIndex: 1,
		pageSize: 10,
		totalCount: 0,
		loading: false,
		selections: []
	});

	const checkinDialog = reactive({
		visible: false,
		btnText: '拍照',
		btnIcon: Camera,
		showEmpty: true,
		showVideo: false,
		showPhoto: false,
		streamTrack: null,
		dataForm: {
			name: null,
			sex: null,
			pid: null,
			photo_1: null,
			photo_2: null
		}
	});

	const guidanceDialog = reactive({
		visible: false,
		name: null,
		sex: null,
		age: null,
		pid: null,
		tel: null,
		date: null,
		company: null,
		qrCodeBase64: null,
		checkup: []
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

	function checkinHandle() {
		let current = dayjs().format("YYYY-MM-DD")
		if (current != dataForm.date) {
			proxy.$message({
				message: `将日期改为${current}`,
				type: 'warning',
				duration: 1200
			});
		} else {
			checkinDialog.dataForm.name = null;
			checkinDialog.dataForm.sex = null;
			checkinDialog.dataForm.pid = null;
			checkinDialog.dataForm.photo_1 = null;
			checkinDialog.dataForm.photo_2 = null;
			checkinDialog.showEmpty = true;
			checkinDialog.showVideo = false;
			checkinDialog.showPhoto = false;
			checkinDialog.visible = true;
			/**
			 * 测试数据 下面都是测试数据
			 */
			const name = "屈小波";
			//性别
			const sex = '男';
			//身份证号
			const pid = '110102198508140435';
			checkinDialog.dataForm.name = name;
			checkinDialog.dataForm.sex = sex;
			checkinDialog.dataForm.pid = pid;
			var image = 'data:image/jpg;base64,' + '';
			// const image = 'data:image/jpg;base64,' + '';
			imageToBase64(returnResult).then((resp : any) => {
				image = resp;
				checkinDialog.dataForm.photo_1 = image;
				let json = {
					name: name,
					sex: sex,
					pid: pid
				}
				proxy.$http('/mis/appointment/hasAppointInToday', 'POST', json, true, function (resp) {
					let result = resp.result;
					if (result == -1) {
						proxy.$message({
							message: '已经签到，无需重复签到',
							type: 'warning',
							duration: 1200
						});
					} else if (result == 1) {
						//在弹窗中显示身份证信息
						checkinDialog.dataForm.name = name;
						checkinDialog.dataForm.sex = sex;
						checkinDialog.dataForm.pid = pid;
						checkinDialog.dataForm.photo_1 = image;
						console.log(navigator.getUserMedia);
						console.log(navigator.webkitGetUserMedia);
						console.log(navigator.mozGetUserMedia);
						//获取浏览器是否连接了摄像头
						let bool = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
						if (bool) {
							//获取数据流
							navigator.getUserMedia(
								{ audio: false, video: true },
								function (stream) {
									//根据ID查找视图层中的video控件
									let video = document.querySelector('#video');
									//给视图层video控件设置数据流
									video.srcObject = stream;
									//把视频流保存到模型层，将来关闭弹窗的时候可以切断视频流
									checkinDialog.streamTrack = stream.getTracks()[0];

									//给视图层video控件成功加载视频流
									video.onloadedmetadata = function (e) {
										video.play(); //播放视频流内容
										checkinDialog.showEmpty = false;
										checkinDialog.showPhoto = false;
										checkinDialog.showVideo = true;
									};
								},
								function (err) {
									proxy.$message({
										message: '开启摄像头失败',
										type: 'error',
										duration: 1200
									});
								}
							);
						} else {
							proxy.$message({
								message: '当前电脑没有连接摄像头',
								type: 'error',
								duration: 1200
							});
						}
						// if (navigator.mediaDevices) {
						// 	navigator.mediaDevices.getUserMedia({ audio: false, video: true })
						// 		.then((stream) => {
						// 			let video = document.querySelector('#video');
						// 			video.srcObject = stream;
						// 			checkinDialog.streamTrack = stream.getTracks()[0];
						// 			//给视图层video控件成功加载视频流
						// 			video.onloadedmetadata = function (e) {
						// 				video.play(); //播放视频流内容
						// 				checkinDialog.showEmpty = false;
						// 				checkinDialog.showPhoto = false;
						// 				checkinDialog.showVideo = true;
						// 			};
						// 		})
						// 		.catch((err) => {
						// 			proxy.$message({
						// 				message: `启摄像头失败`,
						// 				type: 'error',
						// 				duration: 1200
						// 			});
						// 		});
						// } else {
						// 	proxy.$message({
						// 		message: '当前电脑没有连接摄像头',
						// 		type: 'error',
						// 		duration: 1200
						// 	});
						// }
					} else {
						proxy.$message({
							message: '该体检人未预约',
							type: 'error',
							duration: 1200
						});
					}
				});
			});
		}
	}
	/*
	 * 身份证信息先是用base16编码，然后再用base64编码。因为JS自带了base64解码函数，所以只需
	 * 要我们定义base16解码的函数。
	 */
	function hex2a(hex) {
		let str_list = '';
		for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2) {
			const a = hex.charCodeAt(i);
			const b = hex.charCodeAt(i + 1);
			const c = b * 256 + a;
			str_list += String.fromCharCode(c);
		}

		return str_list.toString();
	}

	/*
	 * 该函数用于把YYYYMMDD格式的日期字符串转换成YYYY-MM-DD格式
	 */
	function parseDateString(str, deco, zero) {
		let year = str.substr(0, 4);
		let month = str.substr(4, 2);
		let date = str.substr(6);
		if (zero) {
			month = month.substr(0, 1) === '0' ? month.substr(1) : month;
			date = date.substr(0, 1) === '0' ? date.substr(1) : date;
		}
		return `${year}${deco}${month}${deco}${date}`;
	}

	const webUrl = 'ws://127.0.0.1:30004/ws';
	let ws = new WebSocket(webUrl);
	ws.onopen = function (evt) {
		console.log('身份读取WebSocket已连接');

	};
	ws.onclose = function (evt) {
		console.log('身份读取WebSocket已关闭');
	};
	ws.onmessage = function (messageEvent) {
		if (!checkinDialog.visible || !checkinDialog.showEmpty) {
			return;
		}
		//把读卡内容转换成JSON对象
		const jsonObject = JSON.parse(messageEvent.data);

		//Ret属性0代表成功，其他代表读卡失败
		if (jsonObject.Ret == 0) {
			//Cmd是10001代表被动接收读卡结果，10000代表主动读取身份证内容
			if (jsonObject.Cmd == 10001) {
				//获取UserParam信息
				const userParam = JSON.parse(window.atob(jsonObject.UserParam));
				//姓名（结尾包含空格，字符串总长度为15个字符，必须要去除结尾空格）
				const name = hex2a(window.atob(userParam.CardInfo.Name)).trim();
				//性别
				const sex = hex2a(window.atob(userParam.CardInfo.Sex)) == 1 ? '男' : '女';
				//身份证号
				const pid = hex2a(window.atob(userParam.CardInfo.No));
				//生日（例如19920315）
				const temp = hex2a(window.atob(userParam.CardInfo.Birthday));
				//转换生日格式
				const birthday = parseDateString(temp, '-', true);
				//照片
				const image = 'data:image/jpg;base64,' + userParam.BmpInfo;
				//起始有效期
				const validityPeriodBegin = hex2a(window.atob(userParam.CardInfo.ValidityPeriodBegin));
				const expiryBegin = parseDateString(validityPeriodBegin, '-', true);

				//截止有效期
				const validityPeriodEnd = hex2a(window.atob(userParam.CardInfo.ValidityPeriodEnd)).trim();
				const expiryEnd = validityPeriodEnd !== '长期' ? parseDateString(validityPeriodEnd, '-', true) : validityPeriodEnd;
				if (expiryEnd !== '长期') {
					//有效期范围
					let valid = dayjs().isBetween(expiryBegin, expiryEnd);
					if (!valid) {
						proxy.$message({
							message: '身份证已过期',
							type: 'error',
							duration: 1200
						});
						return
					}
				}
				//比对身份证信息与体检人信息是否一致（这里是新补充的代码）
				let json = {
					name: name,
					sex: sex,
					pid: pid
				}
				proxy.$http('/mis/appointment/hasAppointInToday', 'POST', json, true, function (resp) {
					let result = resp.result;
					if (result == -1) {
						proxy.$message({
							message: '已经签到，无需重复签到',
							type: 'warning',
							duration: 1200
						});
					} else if (result == 1) {
						//在弹窗中显示身份证信息
						checkinDialog.dataForm.name = name;
						checkinDialog.dataForm.sex = sex;
						checkinDialog.dataForm.pid = pid;
						checkinDialog.dataForm.photo_1 = image;
						//获取浏览器是否连接了摄像头
						let bool = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
						if (bool) {
							//获取数据流 如果是localhost是可以获取到的 如果是https协议是可以的 如果是http 在序号 在https://blog.csdn.net/myyCSDN1226/article/details/134956231里面设置才可以使用
							navigator.getUserMedia(
								{ audio: false, video: true },
								function (stream) {
									//根据ID查找视图层中的video控件
									let video = document.querySelector('#video');
									//给视图层video控件设置数据流
									video.srcObject = stream;
									//把视频流保存到模型层，将来关闭弹窗的时候可以切断视频流
									checkinDialog.streamTrack = stream.getTracks()[0];

									//给视图层video控件成功加载视频流
									video.onloadedmetadata = function (e) {
										video.play(); //播放视频流内容
										checkinDialog.showEmpty = false;
										checkinDialog.showPhoto = false;
										checkinDialog.showVideo = true;
									};
								},
								function (err) {
									proxy.$message({
										message: '开启摄像头失败',
										type: 'error',
										duration: 1200
									});
								}
							);
						} else {
							proxy.$message({
								message: '当前电脑没有连接摄像头',
								type: 'error',
								duration: 1200
							});
						}
					} else {
						proxy.$message({
							message: '该体检人未预约',
							type: 'error',
							duration: 1200
						});
					}
				});
			}
		} else {
			console.log('websocket 协议调用失败，原因：' + jsonObject.ErrInfo);
		}
	};

	function takePhotoHandle() {
		if (checkinDialog.btnText == '拍照') {
			let video = document.querySelector('#video');
			let canvas = document.querySelector('#photo');

			let context = canvas.getContext('2d');
			//把摄像头当前的取景内容绘制到canvas控件中
			context.drawImage(video, 0, 0, 460, 345);

			//显示canvas控件，隐藏两个排他控件
			checkinDialog.showEmpty = false;
			checkinDialog.showVideo = false;
			checkinDialog.showPhoto = true;

			proxy.$message({
				message: '拍照成功',
				type: 'success',
				duration: 1200
			});
			//更新按钮文字和图标
			checkinDialog.btnText = '重拍';
			checkinDialog.btnIcon = RefreshRight;
			//把canvas中的图片转换成base64编码
			checkinDialog.dataForm.photo_2 = canvas.toDataURL('image/jpeg');
		} else {
			//隐藏canvase，显示摄像头取景
			checkinDialog.showEmpty = false;
			checkinDialog.showVideo = true;
			checkinDialog.showPhoto = false;
			//更新按钮文字和图标
			checkinDialog.btnText = '拍照';
			checkinDialog.btnIcon = Camera;
		}
	}

	function closeHandle() {
		console.log("closeHandle hhhhhh");
		if (checkinDialog.streamTrack != null) {
			checkinDialog.streamTrack.stop();
		}
		checkinDialog.showEmpty = true;
		checkinDialog.showVideo = false;
		checkinDialog.showPhoto = false;
		checkinDialog.visible = false;
		checkinDialog.btnText = '拍照';
		checkinDialog.btnIcon = Camera;
	}

	function selectable(row, index) {
		if (row.emps > 0) {
			return false;
		}
		return true;
	}

	function selectionChangeHandle(val) {
		data.selections = val;
	}

	function dataFormSubmit() {
		let json = {
			pid: checkinDialog.dataForm.pid,
			name: checkinDialog.dataForm.name,
			photo_1: checkinDialog.dataForm.photo_1,
			photo_2: checkinDialog.dataForm.photo_2
		};
		proxy.$http('/mis/appointment/checkin', 'POST', json, true, function (resp) {
			if (resp.result) {
				ElNotification({
					title: '通知消息',
					message: "签到成功",
					type: "success",
					duration: 1200
				});
				checkinDialog.showEmpty = true;
				checkinDialog.showVideo = false;
				checkinDialog.showPhoto = false;
				checkinDialog.btnIcon = Camera;
				checkinDialog.btnText = '拍照';
				checkinDialog.dataForm.name = null;
				checkinDialog.dataForm.sex = null;
				checkinDialog.dataForm.pid = null;
				checkinDialog.dataForm.photo_1 = null;
				checkinDialog.dataForm.photo_2 = null;
			} else {
				proxy.$message({
					message: '签到失败',
					type: 'error',
					duration: 1200
				});
			}
		});
	}

	function guidanceHandle(id) {
		guidanceDialog.visible = true;
		let json = { id: id };
		proxy.$http('/mis/appointment/searchGuidanceInfo', 'POST', json, true, function (resp) {
			let result = resp.result;
			guidanceDialog.name = result.name;
			guidanceDialog.sex = result.sex;
			guidanceDialog.age = result.age;
			guidanceDialog.pid = result.pid;
			guidanceDialog.tel = result.tel;
			guidanceDialog.date = result.date;
			guidanceDialog.company = result.company == null ? '无' : result.company;
			guidanceDialog.checkup = result.checkup;
			guidanceDialog.qrCodeBase64 = result.qrCodeBase64;
		});
	}

	function finishHandle() {
		ElMessageBox.prompt('请输入体检单编号，结束该次体检', '提示信息', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			inputPlaceholder: "体检编号",
			type: "warning",
			inputPattern: /^[0-9a-zA-Z]{32}$/,
			inputErrorMessage: '体检编号不正确',
		}).then(({ value }) => {
			let json = { uuid: value, status: 3 }
			proxy.$http('/mis/appointment/updateStatusByUuid', 'POST', json, true, function (resp) {
				if (resp.result) {
					proxy.$message({
						message: '操作成功',
						type: 'success',
						duration: 1200,
						onClose: () => {
							loadDataList();
						}
					});
				} else {
					proxy.$message({
						message: '未能更新记录',
						type: 'error',
						duration: 1200
					});
				}
			});
		});
	}
</script>

<style lang="less" scoped>
	@import url('customer_checkin.less');
</style>