<template>
	<div class="goods-detail">
		<img :src="data.image" class="cover" />
		<div class="property">
			<h3 class="title">{{data.title}}{{data.code}}</h3>
			<p class="desc">{{data.description}}</p>
			<div class="row">
				<label>官网价格：</label>
				<div class="info">
					<span class="current-price">{{data.currentPrice}}</span>
					<span class="initial-price">￥{{data.initialPrice}}</span>
				</div>
			</div>
			<div class="row">
				<label>享有折扣：</label>
				<div class="info">
					<img src="../../assets/front/goods/discount.png" class="discount-img" />
					<span class="discount">{{data.ruleName != null ? data.ruleName : '无'}}</span>
				</div>
			</div>
			<div class="row">
				<label>商品类型:</label>
				<div class="info">
					虚拟卡（电子卡密）
				</div>
			</div>
			<div class="row">
				<label>适用人群：</label>
				<div class="info">
					{{data.type}}
				</div>
			</div>
			<div class="row">
				<label>购买数量：</label>
				<div class="info">
					<el-input-number v-model="dataForm.number" size="small" :min="1" :max="10"
						@change="handleChange"></el-input-number>
				</div>
			</div>
			<div class="row">
				<label>服务承诺：</label>
				<div class="info">
					<img src="../../assets/front/goods/property-icon-1.png" class="property-icon" />
					<span class="service-tag">专业品质</span>
					<img src="../../assets/front/goods/property-icon-2.png" class="property-icon" />
					<span class="service-tag">官方直营</span>
					<img src="../../assets/front/goods/property-icon-3.png" class="property-icon" />
					<span class="service-tag">随时改</span>
					<img src="../../assets/front/goods/property-icon-4.png" class="property-icon" />
					<span class="service-tag">随时退</span>
				</div>
			</div>
			<div class="operate">
				<div class="consult-btn" @click="consultHandle">
					<img src="../../assets/front/goods/consult.png" class="consult-icon" />
					<span>咨询客服</span>
				</div>
				<div class="buy-btn" @click="createPayment">
					立即付款
				</div>
			</div>
		</div>
	</div>
	<el-divider />
	<div class="goods-content">
		<el-descriptions title="商品摘要信息" :column="3" size="large" border>
			<el-descriptions-item label="体检名称" label-align="center">{{data.title}}{{data.code}}</el-descriptions-item>
			<el-descriptions-item label="体检类型" label-align="center">{{data.type}}</el-descriptions-item>
			<el-descriptions-item label="适用人群" label-align="center">
				<span class="tag" v-for="one in data.tag">{{one}}</span>
			</el-descriptions-item>
			<el-descriptions-item label="体检机构" label-align="center"> 北京市耀东大健康体检中心（北京市东城区崇文门外大街3号新世界中心写字楼B座五层(8号电梯直达)
				）</el-descriptions-item>
			<el-descriptions-item label="体检项目" label-align="center">{{data.checkupCount}}个</el-descriptions-item>
			<el-descriptions-item label="有效期" label-align="center">一年</el-descriptions-item>
		</el-descriptions>
		<div class="detail">
			<fieldset>
				<legend>体检项目明细</legend>
				<div v-if="data.count_1 > 0">
					<h4 class="detail-title">科室检查({{data.count_1}}项目)</h4>
					<table class="detail-table">
						<tr v-for="one in data.checkup_1">
							<th>{{one.title}}</th>
							<td>{{one.content}}</td>
						</tr>
					</table>
				</div>
				<div v-if="data.count_2 > 0">
					<h4 class="detail-title">实验室检查({{data.count_2}}项目)</h4>
					<table class="detail-table">
						<tr v-for="one in data.checkup_2">
							<th>{{one.title}}</th>
							<td>{{one.content}}</td>
						</tr>
					</table>
				</div>
				<div v-if="data.count_3 > 0">
					<h4 class="detail-title">医技检查({{data.count_3}}项目)</h4>
					<table class="detail-table">
						<tr v-for="one in data.checkup_3">
							<th>{{one.title}}</th>
							<td>{{one.content}}</td>
						</tr>
					</table>
				</div>
				<div v-if="data.count_4 > 0">
					<h4 class="detail-title">其他检查({{data.count_4}}项目)</h4>
					<table class="detail-table">
						<tr v-for="one in data.checkup_4">
							<th>{{one.title}}</th>
							<td>{{one.content}}</td>
						</tr>
					</table>
				</div>
			</fieldset>
		</div>
	</div>
	<div class="checkup-appointment">
		<fieldset>
			<legend>预约须知</legend>
			<el-descriptions title="" :column="1" size="large" class="descriptions">
				<el-descriptions-item label="预约时间:" label-align="center"
					style="width: 300px;">该医院支持提前可约，若要预约当天请在08:30前下单</el-descriptions-item>
				<el-descriptions-item label="营业时间：" label-align="center">
					周一至周五08:00-10:30(到院时间为08:00-10:30)
				</el-descriptions-item>
				<el-descriptions-item label="体检地点：" label-align="center">
					北京市东城区崇文门外大街3号新世界中心写字楼B座五层(8号电梯直达)
				</el-descriptions-item>
				<el-descriptions-item label="体检凭证：" label-align="center">
					体检当天凭借预约成功短信，现场出示身份证即可体检
				</el-descriptions-item>
				<el-descriptions-item label="优惠信息：" label-align="center">
					会员在线支付时含“立减”字样的套餐，付款时会自动抵扣掉对应的金额
				</el-descriptions-item>
				<el-descriptions-item label="订单退改：" label-align="center">
					如客户预约成功后选择退款，需扣除套餐实付金额的10%作为服务费。最高扣款金额不超过100元。（*个别体检中心执行单独退赔政策*）
				</el-descriptions-item>
				<el-descriptions-item label="注意事项：" label-align="center">
					当您预约套餐时，即表示接受检测的所有项目。如因自身原因放弃体检套餐中的检查项目，网站将不予退款处理
				</el-descriptions-item>
				<el-descriptions-item label="发票申请：" label-align="center">
					请在体检后到“我的订单”中申请，如需了解开票具体流程，可在提交订单后及时联系中康体检网客服，客服热线：4008007580
				</el-descriptions-item>
			</el-descriptions>
		</fieldset>
		<fieldset>
			<legend>线上预约优势</legend>
			<div class="content">
				<div class="advantage">
					<div class="card">
						<div class="left">
							<span>提前确认到院可检</span>
						</div>
						<div class="right">
							<span>提前选择体检时间、体检套餐，避免部分医院预约号紧缺，而导致当天无法体检的状况。</span>
						</div>
					</div>
					<div class="card">
						<div class="left"><span>省时方便无需排队</span></div>
						<div class="right">
							<span>体检当天携带身份证到院打印体检单，即可开始体检，无需排队缴费。</span>
						</div>
					</div>
					<div class="card">
						<div class="left"><span>电话通知灵活改期</span></div>
						<div class="right">
							<span>预约成功后如需改期，可提前电话告知客服，灵活安排行程。</span>
						</div>
					</div>
					<div class="card">
						<div class="left"><span>享受优惠节省费用</span></div>
						<div class="right">
							<span>线上体检套餐，享受团体体检优惠价格，大部分可享医院价的7-9折。</span>
						</div>
					</div>
				</div>
				<div class="timeline">
					<ul>
						<li>
							<img src="../../assets/front/goods/timeline-icon-1.png" class="list-img" />
							<div class="list-line"></div>
							<div class="list-tag">
								<img src="../../assets/front/goods/timeline-tag-1.png" />
								<span>1</span>
							</div>
							<div class="list-content">
								<h4>选购体检套餐</h4>
								<p>确认订单无误后，完成线上支付</p>
							</div>
						</li>
						<li>
							<img src="../../assets/front/goods/timeline-icon-2.png" class="list-img" />
							<div class="list-line"></div>
							<div class="list-tag">
								<img src="../../assets/front/goods/timeline-tag-2.png" />
								<span>2</span>
							</div>
							<div class="list-content">
								<h4>完成预约体检</h4>
								<p>填写体检人信息及体检日期</p>
							</div>
						</li>
						<li>
							<img src="../../assets/front/goods/timeline-icon-3.png" class="list-img" />
							<div class="list-line"></div>
							<div class="list-tag">
								<img src="../../assets/front/goods/timeline-tag-3.png" />
								<span>3</span>
							</div>
							<div class="list-content">
								<h4>到院体检</h4>
								<p>到院出示身份证，领取体检单体检</p>
							</div>
						</li>
						<li>
							<img src="../../assets/front/goods/timeline-icon-4.png" class="list-img" />
							<div class="list-line"></div>
							<div class="list-tag">
								<img src="../../assets/front/goods/timeline-tag-4.png" />
								<span>4</span>
							</div>
							<div class="list-content">
								<h4>获取体检报告</h4>
								<p>根据医院情况，到前台登记自取或自费邮寄</p>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</fieldset>
		<fieldset>
			<legend>体检注意事项</legend>
			<div class="content">
				<ul class="look-list">
					<li class="item">
						<div class="left">
							体检前
						</div>
						<div class="right">
							<ul>

								<li>体检前一天请您清淡饮食,勿饮酒、勿劳累。体检当天请空腹。</li>
								<li>
									体检前一天要注意休息，晚上8点后不再进食。避免剧烈运动和情绪激动，保证充足睡眠，以免影响体检结果。
								</li>
								<li>例假期间不宜做妇科、尿液检查。</li>
							</ul>
						</div>
					</li>
					<li class="item">
						<div class="left">
							体检中
						</div>
						<div class="right">
							<ul>
								<li>需空腹检查的项目为抽血、腹部B超、数字胃肠，胃镜及其它标注的体检项目。</li>
								<li>做膀胱、子宫、附件B超时请勿排尿，如无尿需饮水至膀胱充盈。做妇科检查前应排空尿。</li>
								<li>未婚女性不做妇科检查；怀孕的女性请预先告知医护人员,不安排做放射及其他有影响的检查。</li>
								<li>做放射线检查前,请您除去身上佩戴的金银、玉器等饰物。</li>
								<li>
									核磁共振检查，应禁止佩带首饰、手表、传呼、手机等金属物品，磁卡也不应带入检查室，以防消磁。
								</li>
							</ul>
						</div>
					</li>
					<li class="item">
						<div class="left">
							体检后
						</div>
						<div class="right">
							<ul>
								<li>全部项目完毕后请您务必将体检单交到前台。</li>
								<li>请您认真听取医生的建议,及时复查.随诊或进一步检查治疗。</li>
								<li>请您保存好体检结果，以便和下次体检结果作对照，也可作为您就医时的资料。</li>
							</ul>
						</div>
					</li>
				</ul>
			</div>
		</fieldset>
	</div>
	<el-dialog titile="购买体检套餐" :close-on-click-modal="false" v-model="dialog.visible" width="305px" center>
		<img :src="dialog.qrCode" class="qrcode" v-if="!dialog.result" />
		<div v-if="dialog.result" class="pay-success">
			<el-result icon="success" title="付款成功" sub-title="请根据提示进行操作"></el-result>
		</div>
		<div class="dialog-footer-style">
			<el-button type="danger" size="medium" v-if="!dialog.result" @click="closeHandle">取消支付</el-button>
			<el-button type="primary" size="medium" v-if="!dialog.result" @click="successHandle">支付成功</el-button>
			<el-button type="primary" size="medium" v-if="dialog.result" @click="closeHandle">关闭窗口</el-button>
		</div>
	</el-dialog>
</template>

<script setup lang="ts">
	import { reactive, ref, Ref, getCurrentInstance, onMounted } from 'vue';
	import { ElMessageBox } from 'element-plus';
	import router from '../../router/index';
	const { proxy } = getCurrentInstance();

	const dataForm = reactive({ number: 1 });

	const dialog = reactive({
		visible: false,
		result: false,
		qrCode: null,
		outTradeNo: null//订单流水号，查询付款结果时候用
	});

	// const data = reactive({
	// 	code: "117GWMN00",
	// 	title: "新感恩敬老中级体检套餐",
	// 	description: "「感恩季到检钜惠」适合人群：适用于中、老年人及血管疾病人群 （参加第二件0元活动 需加入购物车后数量选2）",
	// 	image: "https://static-upyunmall.health.ikang.com/image/platform/20210820/601f36112df548a082de36365c6f1440.jpg!/fw/810/format/webp",
	// 	initialPrice: 2249.00,
	// 	currentPrice: 2142.00,
	// 	ruleName: null,
	// 	type: "父母体检",
	// 	tag: ["中老年", "女性", "男性"],
	// 	checkup_1: [
	// 		{ "title": "一般健康检查", "content": "身高、体重、血压、心、肺、肝、脾、神经系统 ；甲状腺、乳腺、肛门、直肠" }
	// 	],
	// 	checkup_2: [
	// 		{
	// 			"title": "C反应蛋白",
	// 			"content": "升高常见于：急性炎症、组织坏死、恶性肿瘤、风湿病等疾病"
	// 		},
	// 		{
	// 			"title": "肝功10项",
	// 			"content": "丙氨酸氨基转移酶(ALT)测定 ；天门冬氨酸氨基转移酶(AST)测定；总蛋白(TP)测定 ；白蛋白(Alb)测定 ；碱性磷酸酶(ALP)测定 ;γ-谷氨酰基转移酶(GGT)测定;总胆红素(T-Bil)测定;直接胆红素(D-Bil)测定 ；总胆汁酸(TBA)测定 ；胆碱脂酶(ChE)测定"
	// 		},
	// 		{
	// 			"title": "甲功七项",
	// 			"content": "三碘甲状腺原氨酸(T3)测定 ；甲状腺素(T4)测定 ；促甲状腺激素(TSH)测定 ；游离三碘甲状腺原氨酸(FT3)测定 ；游离甲状腺素(FT4)测定 ；抗甲状腺球蛋白抗体(TGAb)测定 ；抗甲状腺过氧化物酶抗体(TPOAb)测定"
	// 		},
	// 		{
	// 			"title": "尿常规",
	// 			"content": "尿常规化学分析；尿有形成分分析"
	// 		},
	// 		{
	// 			"title": "肾功5项",
	// 			"content": "尿素(Urea)测定 ；肌酐(Cr)测定 ；葡萄糖(Glu)测定 ；尿酸(UA)测定 ；β2微球蛋白(β2-MG)测定"
	// 		},
	// 		{
	// 			"title": " 糖化血红蛋白",
	// 			"content": "检测近2-3个月内的平均血糖水平、用于糖尿病疗效观察"
	// 		},
	// 		{
	// 			"title": " 同型半胱氨酸",
	// 			"content": "HCY升高是心血管疾病的重要危险因素"
	// 		}
	// 	],
	// 	checkup_3: [
	// 		{
	// 			"title": "泌尿系彩色多普勒超声检查",
	// 			"content": "双肾、肾盂、输尿管、膀胱壁、[前列腺（男）]"
	// 		},
	// 		{
	// 			"title": "肝胆胰脾彩色多普勒超声检查",
	// 			"content": "肝胆胰脾彩色多普勒超声检查"
	// 		},
	// 		{
	// 			"title": "数字化摄影（指CR/DR)",
	// 			"content": "心、肺、膈等"
	// 		},
	// 		{
	// 			"title": "超声骨密度检测",
	// 			"content": "超声仪检查骨量情况，无骨质疏松、骨量减少"
	// 		},
	// 		{
	// 			"title": "心电图",
	// 			"content": "检查心脏有否器官功能性病变，如：窦性心动过速、过缓、不齐以及各种心脏病的筛查"
	// 		}
	// 	],
	// 	checkup_4: [
	// 		{
	// 			"title": "肿物标记物（男）",
	// 			"content": " 男：甲胎蛋白(AFP)测定 ；癌胚抗原(CEA)测定 ;游离前列腺特异性抗原(FPSA)测定 ；总前列腺特异性抗原(TPSA)测定 ；糖类抗原CA-199测定"
	// 		}
	// 	],
	// 	count_1: 5,
	// 	count_2: 20,
	// 	count_3: 10,
	// 	count_4: 1,
	// 	checkupCount: 25
	// });
	const data = reactive({
		code: null,
		title: null,
		description: null,
		image: null,
		initialPrice: null,
		currentPrice: null,
		ruleName: null,
		type: null,
		tag: [],
		checkup_1: [],
		checkup_2: [],
		checkup_3: [],
		checkup_4: [],
		count_1: null,
		count_2: null,
		count_3: null,
		count_4: null,
		checkupCount: null
	});

	// //路由器传递的商品主键ID,该页面要根据商品主键值加载商品信息
	let id = router.currentRoute.value.params.id;
	//滚到页面顶部，否则路由跳转页面之后，还在原位置
	window.scrollTo(0, 0);
	proxy.$http('/front/goods/searchById', 'POST', { id: id }, true, function (resp) {
		let result = resp.result;
		if (result == null) {
			proxy.$message({
				message: '无法加载该商品',
				type: 'warning',
				duration: 1200,
				onClose: () => {
					router.push({ name: "FrontGoodsList" })
				}
			});
		} else {
			data.code = result.code;
			data.title = result.title;
			data.description = result.description;
			data.image = `${proxy.$minioUrl}/${result.image}`;
			data.initialPrice = result.initialPrice;
			data.currentPrice = result.currentPrice;
			data.ruleName = result.ruleName;
			data.type = result.type;
			data.tag = result.type;
			data.tag = result.tag;
			data.checkup_1 = result.checkup_1;
			data.checkup_2 = result.checkup_2;
			data.checkup_3 = result.checkup_3;
			data.checkup_4 = result.checkup_4;
			data.count_1 = result.count_1;
			data.count_2 = result.count_2;
			data.count_3 = result.count_3;
			data.count_4 = result.count_4;
			data.checkupCount = result.count_1 + result.count_2 + result.count_3 + result.count_4;
		}
	});

	function createPayment() {
		dialog.outTradeNo = null;
		dialog.qrCode = null;
		dialog.result = false;
		//check whether login
		proxy.$http('/front/customer/checkLogin', 'GET', null, true, function (resp) {
			if (!resp.result) {
				proxy.$message({
					message: '请先登录系统',
					type: 'warning',
					duration: 1200
				});
			}
			else {
				proxy.$confirm('您确定购买该体检套餐？', '提示信息', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'info'
				}).then(() => {
					let json = { goodsId: id, number: dataForm.number };
					proxy.$http('/front/order/createPayment', 'POST', json, true, function (resp) {
						if (!resp.illegal) {
							dialog.visible = true;
							let result = resp.result;
							dialog.outTradeNo = result.outTradeNo;
							dialog.qrCode = result.qrCodeBase64;
							// websocket 接受后端推送的付款结果
							let token = localStorage.getItem('token');
							proxy.$options.sockets.onmessage = function (resp) {
								let data = resp.data;
								let json = JSON.parse(data);
								if (json.result) {
									dialog.result = true;
									//delete 消息监听
									delete proxy.$options.sockets.onmessage;
								}
							};
							//发送消息，让后端session会话，将来才能推送消息
							proxy.$socket.sendObj(
								{ opt: 'ping', identity: 'customer', token: token }
							);
						} else {
							ElMessageBox.alert(
								'今日您的未支付订单或退款订单已达到上线， 将导致今日不能再下单。请明日再来购买体检套餐！',
								'提示信息',
								{}
							);
						}
					});
				});
			}
		});
	}

	function closeHandle() {
		dialog.visible = false;
	}

	function successHandle() {
		let json = { outTradeNo: dialog.outTradeNo };
		proxy.$http('/front/order/searchPaymentResult', 'POST', json, true, function (resp) {
			if (!resp.result) {
				proxy.$message({
					message: '付款不成功',
					type: 'error',
					duration: 1200
				});
			} else {
				dialog.result = true;
				delete proxy.$options.sockets.onmessage;
			}
		});
	}
</script>

<style lang="less" scoped>
	@import url('goods.less');
</style>