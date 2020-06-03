<?php
namespace Home\Controller;

class NewadController extends HomeController
{
	public function test() {
		$list = M('ad_sell')->field('sum(b.deal_amount) as tdeal, a.*, amount-sum(b.deal_amount) as remain')->alias('a')->join('__ORDER_BUY__ b on a.id=b.sell_sid')
		->order('remain desc')->group('a.id')->select();
		dump($list);
	}
	public function index($coinid=null)
	{
		if (!userid()) {
			redirect('/#login');
		}
		if (checkstr($coinid)) {
			$this->error('您输入的信息有误！');
		}
		
		$user_info = M('User')->where(array('id' => userid()))->find();
		$this->assign('user_info', $user_info);
		if ($user_info['paypassword'] == '') {
			$this->assign('paypassset',1);
		}
		if(empty($user_info['c_bank_card']) && empty($user_info['c_wechat_account']) && empty($user_info['c_alipay_account'])){
			$this->error('您还未设置支付信息',U("Finance/payset"));
		}

		$config_info = M('Config')->where(array('id' => 1))->field('fee_bili')->find();
		$this->assign('config', $config_info);

		$coin = M('Coin')->field('id,title,js_yw,name')->where(array('status'=>1, 'name'=>array('neq', 'cny'), 'c2c_show'=>0))->select();
		$this->assign('coin', $coin);
		if(!$coinid) {
			$coinname = $coin[0]['name'];
		}else{
			$coinname = M('Coin')->where(array('id'=>$coinid))->getField('name');
		}
		$this->balance = M('user_coin')->where(array('userid' => userid()))->getField($coinname.'c');
		$location = M('Location')->select();
		$this->assign('location', $location);
		if(empty($coinid) || $coinname='qu'){
			$currency = M('Btc')->select();
		}else{
			$table = M('Coin')->where("id=$coinid")->getField('name');
			$currency = M($table)->select();
		}
		$this->assign('currency', $currency);

		$pay_method = M('PayMethod')->select();
		$this->assign('pay_method', $pay_method);

		$this->display();
	}

	public function upad($is_margin, $pay_method2 = 0, $pay_method3 = 0, $amount, $paypassword, $code, $price, $type, $coin, $location, $currency, $margin=null, $min_price=null, $min_limit, $max_limit, $due_time=null, $message=null, $pay_method, $safe_option=null, $trust_only=null, $open_time=null, $token)
	{

		$extra = '';

		// 过滤非法字符----------------S

		if (checkstr($margin) || checkstr($min_price) || checkstr($min_limit) || checkstr($max_limit) || checkstr($due_time) || checkstr($message)) {
			$this->error('您输入的信息有误！', $extra);
		}

		// 过滤非法字符----------------E

		if (!userid()) {
			redirect('/#login');
		}
		$user_info = M('User')->where(array('id' => userid()))->find();
		if($user_info['idcardauth'] ==0){
			$this->error('请先至个人中心进行身份认证并审核通过！');
		}
		if($type != 0 && $type != 1){
			$this->error("广告类型错误！", $extra);
		}

		if (!session('newadtoken')) {
			set_token('newad');
		}
		if (!empty($token)) {
			$res = valid_token('newad', $token);
			if (!$res) {
				$this->error('请不要频繁提交！', session('newad'));
			}
		}
		if(session('realad_verify') != $code){
			$this->error('手机验证码错误！', $extra);
		}
		$extra = session('newadtoken');
		
		if ($user_info['paypassword'] == '') {
			$this->error("请先设置交易密码！", $extra);
		}
		if($user_info['paypassword'] != md5($paypassword)){
			$this->error('交易密码错误', $extra);
		}
		$table = ($type == 0)?'AdBuy':'AdSell';

		//检查发布广告是否超过两次
		$count = M($table)->where(array('userid' => userid()))->count();
		if($count >= 20){
			$this->error('同种类型广告最多发布两个！', $extra);
		}

		/*if (!check($margin, 'margin')) {
			$this->error('溢价为-99.99 至 99.99 的数值', $extra);
		}

		if($min_price != ''){
			$min_price = $min_price;
			if (!check($min_price, 'currency')) {
				$this->error('最低价格式错误！', $extra);
			}
		}

		if($due_time != ''){
			if (!check($due_time, 'duetime') || $due_time>60) {
				$this->error('付款期限请填写5到60分钟之间！', $extra);
			}
		}*/

		if (!check($min_limit, 'currency')) {
			$this->error('最小限额格式错误！', $extra);
		}else{
			if($min_limit < 50){$this->error('最小限额不能小于50！', $extra);}
		}
		if (!check($max_limit, 'currency')) {
			$this->error('最大限额格式错误！', $extra);
		}
		if ($min_limit > $max_limit) {
			$this->error('最小限额不能大于最大限额！', $extra);
		}
		if($price < 0 || !is_numeric($price)){
			$this->error('请输入正确的价格！', $extra);
		}
		if($amount < 0 || !is_numeric($amount)){
			$this->error('请输入正确的数量！', $extra);
		}
		//重组开放时间
		/*$open_time_arr = explode(',',$open_time);
		foreach ($open_time_arr as $k => $v){
			if($this->checkopentime($v)){
				$this->error('请检查开放时间！', $extra);
			}else{
				if($v == 'a-a' || $v == '0-24'){
					$open_time_arr[$k] = 1;
				}
				if($v == 'z-z'){
					$open_time_arr[$k] = 0;
				}
			}
		}
		$open_time =implode(',',$open_time_arr);*/
		if($is_margin == 0) {
			//不开启溢价
		}else{
			//开启溢价
			$price = get_price($coin,$currency,1);
			$price = round($price + $price * $margin / 100, 2);
		}
		$coin_info = M('Coin')->where(array('id'=>$coin))->find();
		if($coin_info['c2c_min_price']>0 && $coin_info['c2c_max_price']>0) {
			if($price < $coin_info['c2c_min_price'] || $price > $coin_info['c2c_max_price']){
				$this->error('价格区间：'.$coin_info['c2c_min_price'].'-'.$coin_info['c2c_max_price'], $extra);
			}
		}
		if($start_str && $end_str) {
			$ymd = date("Y-m-d", time());
			$start_str = $ymd.' '.$coin_info['c2c_start_time'].':00';
			$end_str = $ymd.' '.$coin_info['c2c_end_time'].':00';
			if(time() < strtotime($start_str) || time() > strtotime($end_str)){
				$this->error('每日发布广告时间：'.$coin_info['c2c_start_time'].'-'.$coin_info['c2c_end_time'], $extra);
			}
		}
		$ad_no = $this->getadvno();
		
		//dump($amount);
		$remain = M('user_coin')->where(array('userid'=>userid()))->getField($coin_info['name'].'c');
		//$price = get_price($coin,$currency,1);
		//$price = round($price + $price * $margin / 100, 2);
		
		$should_max_limit = $remain*$price;
		if($max_limit > $should_max_limit && $remain > 0 && $type == 1){
			$this->error('账户余额不足，该价格最大限额'.$should_max_limit);
		}
		if($min_limit > $should_max_limit) {
			$this->error('账户余额不足');
		}
		//插入出售表
		if($type == 1) {
			//如果账户没有余额，则不上架,state=0
			if($remain > 0){
				$state = 1;
			}else{
				$state = 2;
			}
			$rs = M($table)->add(
					array(
							'userid' => userid(), 'add_time' => time(), 'coin'=>$coin, 
							'location' => $location, 'currency' => $currency, 
							'margin' => $margin, 'min_price' => $min_price, 
							'min_limit' => $min_limit, 'max_limit' => $max_limit, 
							'pay_method' => $pay_method, 'pay_method2' => $pay_method2, 
							'pay_method3' => $pay_method3, 'message' => $message, 
							'safe_option' => $safe_option, 'trust_only' => $trust_only, 
							'open_time' => $open_time, 'state' => $state,'ad_no' => $ad_no, 
							'fee'=>$coin_info['cs_ts2'] > 0 ? $coin_info['cs_ts2']:0, 
							'price'=>$price, 'amount'=>$amount, 'is_margin'=>$is_margin));
		}

		//插入购买表
		if($type == 0){
			$rs = M($table)->add(array('userid' => userid(), 'add_time' => time(), 'coin'=>$coin, 'location' => $location, 'currency' => $currency, 'margin' => $margin, 'due_time' => $due_time, 'min_limit' => $min_limit, 'max_limit' => $max_limit, 'pay_method' => $pay_method, 'message' => $message, 'safe_option' => $safe_option, 'trust_only' => $trust_only, 'open_time' => $open_time, 'state' => 1,'ad_no' => $ad_no, 'fee'=>$coin_info['cs_ts2']));
		}

		if ($rs) {
			$this->success('发布成功！', $extra);
		} else {
			$this->error('发布失败!请重试', $extra);
		}

	}

	public function ediad($id,$type,$coinid=null)
	{

		if (!userid()) {
			redirect('/#login');
		}

		// 过滤非法字符----------------S

		if (checkstr($id) || checkstr($type) || checkstr($coinid)) {
			$this->error('您输入的信息有误！');
		}

		// 过滤非法字符----------------E


		if($type != 0 && $type != 1){
			$this->error("广告类型错误！");
		}

		$table = ($type == 0)?'AdBuy':'AdSell';
		$ad_info = M($table)->where(array('id' => $id,'userid' => userid()))->find();
		if (!$ad_info) {
			$this->error("广告不存在！");
		}
		$ad_info['margin'] = floatval($ad_info['margin']);
		$ad_info['type'] = $type;
		$this->assign('ad_info', $ad_info);//dump($ad_info);

		$coin = M('Coin')->field('id,title,js_yw')->where(array('status'=>1,'name'=>array('neq','cny')))->select();
		$this->assign('coin', $coin);
		if(!$coinid) {
			$coinname = $coin[0]['name'];
		}else{
			$coinname = M('Coin')->where(array('id'=>$coinid))->getField('name');
		}
		$this->balance = M('user_coin')->where(array('userid' => userid()))->getField($coinname.'c');
		$location = M('Location')->select();
		$this->assign('location', $location);

		if(empty($coinid)){
			//dump(1);
			$table = M('Coin')->where("id={$ad_info['coin']}")->getField('name');
			$currency = M($table)->select();
		}else{
			//dump(2);
			$table = M('Coin')->where("id=$coinid")->getField('name');
			$currency = M($table)->select();
		}
		$this->assign('currency', $currency);

		$pay_method = M('PayMethod')->select();
		$this->assign('pay_method', $pay_method);

		$this->assign('type', $type);
		$this->display();
	}

	public function upediad($is_margin, $pay_method2=0, $pay_method3=0, $amount, $paypassword,$code,$price,$type,$id, $coin, $location, $currency, $margin=null, $min_price=null, $min_limit, $max_limit, $due_time=null, $message=null, $pay_method, $safe_option=null, $trust_only=null, $open_time=null, $token)
	{

		$extra = '';

		// 过滤非法字符----------------S

		if (checkstr($margin) || checkstr($min_price) || checkstr($min_limit) || checkstr($max_limit) || checkstr($due_time) || checkstr($message)) {
			$this->error('您输入的信息有误！', $extra);
		}

		// 过滤非法字符----------------E

		if (!userid()) {
			redirect('/login/index');
		}

		if($type != 0 && $type != 1){
			$this->error("广告类型错误！", $extra);
		}
		if(session('realad_verify') != $code){
			$this->error('手机验证码错误！', $extra);
		}
		$table = ($type == 0)?'AdBuy':'AdSell';
		$ad_info = M($table)->where(array('id' => $id,'userid' => userid()))->find();
		if (!$ad_info) {
			$this->error("广告不存在！", $extra);
		}
		$table2 = ($type == 0)?'order_sell':'order_buy';
		$order = M($table2)->where(array('sell_sid'=>$id))->find();
		if(!empty($order)) {
			$this->error('该广告有订单，不能编辑');
		}
		if (!session('newadtoken')) {
			set_token('newad');
		}
		if (!empty($token)) {
			$res = valid_token('newad', $token);
			if (!$res) {
				$this->error('请不要频繁提交！', session('newad'));
			}
		}
		$extra = session('newadtoken');

		/* if (!check($margin, 'margin')) {
			$this->error('溢价为-99.99 至 99.99 的数值', $extra);
		} */

		/* if($min_price != ''){
			if (!check($min_price, 'currency')) {
				$this->error('最低价格式错误！', $extra);
			}
		} */

		/* if($due_time != ''){
			if (!check($due_time, 'duetime') || $due_time>60) {
				$this->error('付款期限请填写5到60分钟之间！', $extra);
			}
		} */

		if ($min_limit > $max_limit) {
			$this->error('最小限额不能大于最大限额！', $extra);
		}
		if (!check($min_limit, 'currency')) {
			$this->error('最小限额格式错误！', $extra);
		}else{
			if($min_limit < 50){$this->error('最小限额不能小于50！', $extra);}
		}
		if (!check($max_limit, 'currency')) {
			$this->error('最大限额格式错误！', $extra);
		}
		if($price < 0 || !is_numeric($price)){
			$this->error('请输入正确的价格！', $extra);
		}
		if($amount < 0 || !is_numeric($amount)){
			$this->error('请输入正确的数量！', $extra);
		}

		//重组开放时间
		/* $open_time_arr = explode(',',$open_time);
		foreach ($open_time_arr as $k => $v){
			if($this->checkopentime($v)){
				$this->error('请检查开放时间！', $extra);
			}else {
				if ($v == 'a-a' || $v == '0-24') {
					$open_time_arr[$k] = 1;
				}
				if ($v == 'z-z') {
					$open_time_arr[$k] = 0;
				}
			}
		}
		$open_time =implode(',',$open_time_arr); */
		if($is_margin == 0) {
			//不开启溢价
		}else{
			//开启溢价
			$price = get_price($coin,$currency,1);
			$price = round($price + $price * $margin / 100, 2);
		}
		$coin_info = M('Coin')->where(array('id'=>$coin))->find();
		if($coin_info['c2c_min_price']>0 && $coin_info['c2c_max_price']>0) {
			if($price < $coin_info['c2c_min_price'] || $price > $coin_info['c2c_max_price']){
				$this->error('价格区间：'.$coin_info['c2c_min_price'].'-'.$coin_info['c2c_max_price'], $extra);
			}
		}
		$remain = M('user_coin')->where(array('userid'=>userid()))->getField($coin_info['name'].'c');
		
		$should_max_limit = $remain*$price;
		if($max_limit > $should_max_limit && $remain > 0 && $type == 1){
			$this->error('账户余额不足，该价格最大限额'.$should_max_limit);
		}
		if($min_limit > $should_max_limit) {
			$this->error('账户余额不足');
		}
		//修改出售表
		if($type == 1) {
			$rs = M('AdSell')->save(array('id' => $id, 'coin'=>$coin, 'location' => $location, 'currency' => $currency, 'margin' => $margin, 'min_price' => $min_price, 'min_limit' => $min_limit, 'max_limit' => $max_limit, 'pay_method' => $pay_method, 'pay_method2' => $pay_method2,  'pay_method3' => $pay_method3, 'amount' => $amount, 'message' => $message, 'safe_option' => $safe_option, 'trust_only' => $trust_only, 'open_time' => $open_time, 'price' => $price, 'is_margin'=>$is_margin));
		}

		//修改购买表
		if($type == 0){
			$rs = M('AdBuy')->save(array('id' => $id, 'coin'=>$coin, 'location' => $location, 'currency' => $currency, 'margin' => $margin, 'due_time' => $due_time, 'min_limit' => $min_limit, 'max_limit' => $max_limit, 'pay_method' => $pay_method, 'message' => $message, 'safe_option' => $safe_option, 'trust_only' => $trust_only, 'open_time' => $open_time));
		}

		if ($rs) {
			$this->success('保存成功！', $extra);
		} else {
			$this->error('保存失败!请重试', $extra);
		}
	}

	//检查开放时间,错误返回1
	public function checkopentime($time){
		//错误时间格式正则
		$regex = '/^\d{1,2}-[a,z]$|^[a,z]-\d{1,2}$|^a-z$|^z-a$/';
		if(preg_match($regex, $time)) {
			return 1;
		}else{
			$time_arr = explode('-',$time);
			if(is_numeric($time_arr[0]) && is_numeric($time_arr[1])){
				if($time_arr[0] >= $time_arr[1]){
					return 1;
				}
			}
		}
	}

	//广告上下架
	public function setShelf($id,$type,$act,$token){

		if (!userid()) {
			redirect('/#login');
		}

		$extra = '';

		// 过滤非法字符----------------S

		if (checkstr($id) || checkstr($token) || checkstr($type) || checkstr($act)) {
			$this->error('您输入的信息有误！',$extra);
		}

		// 过滤非法字符----------------E


		if(!session('shelftoken')) {
			set_token('shelf');
		}
		if(!empty($token)){
			$res = valid_token('shelf',$token);
			if(!$res){
				$this->error('请不要频繁提交！',session('shelftoken'));
			}
			$extra=session('shelftoken');
		}

		if($type != 0 && $type != 1){
			$this->error("广告类型错误！",$extra);
		}

		$table = ($type == 0)?'AdBuy':'AdSell';
		$ad_info = M($table)->where(array('id' => $id,'userid' => userid()))->find();
		if (!$ad_info) {
			$this->error("广告不存在！",$extra);
		}else{
			if($ad_info['state'] ==4){
				$this->error("此广告已冻结禁止上下架操作！",$extra);
			}
		}
		$sellcoin=M('user_coin')->where('userid='.$ad_info['userid'])->find();
		$coin_name = M('coin')->where(array('id'=>$ad_info['coin']))->getField('name');
		if($act == 1){
			//$price = get_price($ad_info['coin'],$ad_info['currency'],1);
			//$price = round($price + $price * $ad_info['margin'] / 100, 2);
			$price = $ad_info['price'];
			$should_min_num = $ad_info['min_limit']/$price;
			$should_min_fee = round($should_min_num*$ad_info['fee']/100,8);
			$should_min_total = $should_min_num+$should_min_fee;
			if($should_min_total*1 > $sellcoin[$coin_name.'c']*1){
				//下架订单
				//dump($should_min_total);die;
				$this->error('由于您所持有的该币种数量少于'.$should_min_total.'，开启失败，建议您先充值后再开启本广告！', $extra);
			}
		}

		$result = M($table)->where(array('id' => $id,'userid' => userid()))->setField('state',$act);
		if(!empty($result)){
			$this->success("操作成功",$extra);
		}else{
			$this->error("操作失败",$extra);
		}
	}
	
	//广告详情
	public function advdetail($type,$id){

        if (checkstr($id) ||checkstr($type)) {
            $this->error('您输入的信息有误！');
        }

        if($type!=0 && $type!=1 ){
        	$this->error('参数错误！');
        }
		
        if(!is_numeric($id) || $id<=0){
        	$this->error('参数错误！');
        }
		
		//加载聊天信息
		if($type==0){
			$record = M('ad_buy')->where(array('id'=>$id))->find();
			if(empty($record)){
        		$this->error('此广告不存在');
        	}
        	$ltime=$record['due_time'];
		}
		if($type==1){
			$record = M('ad_sell')->where(array('id'=>$id))->find();
       		if(empty($record)){
        		$this->error('此广告不存在');
        	}
        	$ltime=30;
        	$deal_num = M('order_buy')->where(array('sell_sid'=>$id, 'status'=>array('neq', 5)))->sum('deal_num');
        	$deal_num = $deal_num ? $deal_num : 0;//dump($deal_num);
        	$fee_num = M('order_buy')->where(array('sell_sid'=>$id, 'status'=>array('neq', 5)))->sum('fee');
        	$fee_num = $fee_num ? $fee_num : 0;
        	$record['remain_num'] = $record['amount'] - $deal_num - $fee_num;
        	if($record['remain_num'] <= 0){
        		$record['remain_num'] = 0;
        	}
		}
		//币种
		$coin = M('Coin')->where(array('id'=>$record['coin']))->find();
		$this->assign("coin",$coin);
		
		//货币
		$currency = get_price($record['coin'],$record['currency'],0);
		//$currency = M('Currency')->where(array('id'=>$record['currency']))->find();
        $this->assign("currency",$currency);
		
		//付款方式
        $paymethod = M('pay_method')->where(array('id'=>$record['pay_method']))->find();
        $this->assign("paymethod",$paymethod);
		
		//查找用户的信息
        $adverinfo = M('user')->where(array('id'=>$record['userid']))->find();
        //如果在线查询一下账户的余额
        $coin_number=0;
        if(userid()){
        	$my_coin_info = M('user_coin')->where(array('userid'=>userid()))->find();
        	$coin_number = $my_coin_info[$coin['name']];
			if(userid() != $record['userid']){
				//判断一下双方能不能交易
				$trade_permit = tradepermit(userid(),$record);
				$this->assign('trade_permit',$trade_permit);
			}
        }
		
		$record['username'] = $adverinfo['enname'];
		$adverinfo['history'] = floatval($adverinfo['history']);
		//$cprice = M('Currency')->where(array('id'=>$record['currency']))->getField('price');
		if($record['is_margin'] == 1) {
			$cprice = get_price($record['coin'],$record['currency'],1);
			if($cprice < $record['min_price']){$cprice = $record['min_price'];}
			$record['price'] = $cprice*(1+($record['margin']/100));
			$record['price'] = round($record['price'],2);
		}		
		$this->assign('adv',$record);
		
		//生成token
		$chat_token = set_token('chat');
		$this->assign('chat_token',$chat_token);
		
		$module = D('Chat');
		$chatlist = $module->listbyAdvid($id,$type,userid(),"ASC",0);
		foreach($chatlist as $key=>$val){
			$chatlist[$key]['fromuser_img'] = headimg($val['fromuid']);
			$chatlist[$key]['touser_img'] = headimg($val['touid']);
		}
		$this->assign('chatlist',$chatlist);
		
		$this->assign('chatnum',count($chatlist));

        //生成token
		$myxd_token = set_token('myxd');
		$this->assign('myxd_token',$myxd_token);

		$this->assign('iftrust', $this->iftruban($record['userid'],1));
		$this->assign('ifban', $this->iftruban($record['userid'],2));
		$this->assign('trust', gettrust($adverinfo['id']));
        $this->assign('coin_number', $coin_number);
        $this->assign('ltime', $ltime);
        $this->assign('type', $type);
        $this->assign('price', $record['price']);
        $this->assign('adverinfo', $adverinfo);


		$selllist = M('AdSell')->where(array('userid' => $record['userid'], 'state' => 1))->select();
		foreach ($selllist as $k=> $v){
			$selllist[$k]['pay_method'] = M('PayMethod')->where(array('id'=>$v['pay_method']))->getField('name');
			$selllist[$k]['currency_type'] = get_price($v['coin'],$v['currency'],0);
			$selllist[$k]['coin'] = M('Coin')->where(array('id'=>$v['coin']))->getField('name');
			/* $price = get_price($v['coin'],$v['currency'],1);
			if($price < $selllist[$k]['min_price']){
				$price = $selllist[$k]['min_price'];
			}
			$selllist[$k]['price'] = round($price + $price * $v['margin']/100,2);
			$ifopen = ifopen($v['id'],1);
			if($ifopen == 0){
				unset($selllist[$k]);
			} */
		}
		
		/* $buylist = M('AdBuy')->where(array('userid'=>$record['userid'],'state'=>1))->select();
		foreach ($buylist as $k=> $v){
			$buylist[$k]['pay_method'] = M('PayMethod')->where(array('id'=>$v['pay_method']))->getField('name');
			$buylist[$k]['currency_type'] = get_price($v['coin'],$v['currency'],0);
			$buylist[$k]['coin'] = M('Coin')->where(array('id'=>$v['coin']))->getField('name');
			$price = get_price($v['coin'],$v['currency'],1);
			$buylist[$k]['price'] = round($price + $price * $v['margin']/100,2);
			$ifopen = ifopen($v['id'],0);
			if($ifopen == 0){
				unset($buylist[$k]);
			}
		} */

		$this->assign('buylist', $buylist);
		$this->assign('selllist', $selllist);
        $this->display();
	}

	//判断自己是否信任屏蔽该用户(type为1是判断信任为2是判断屏蔽),未信任屏蔽为0,反之为1
	public function iftruban($id,$type){
		$user = M('User')->where(array('id' => $id))->find();
		$trust_ids = $user['xinren'];
		$ban_ids = $user['pingbi'];
		//拆成数组
		$trust_ids_arr = explode(",",$trust_ids);
		$ban_ids_arr = explode(",",$ban_ids);
		if(userid() == ''){return 0;}
		if($type == 1){
			if(in_array(userid(),$trust_ids_arr)){
				return 1;
			}else {
				return 0;
			}
		}
		if($type == 2){
			if(in_array(userid(),$ban_ids_arr)){
				return 1;
			}else {
				return 0;
			}
		}
	}

	//修改信任屏蔽状态
	public function truban($id,$token,$act)
	{
		$extra = '';

		if (!userid()) {
			$this->error('请先登录再操作！',$extra);
		}

		// 过滤非法字符----------------S

		if (checkstr($id) || checkstr($token) || checkstr($act)) {
			$this->error('您输入的信息有误！',$extra);
		}

		// 过滤非法字符----------------E


		if(!session('trubantoken')) {
			set_token('truban');
		}
		if(!empty($token)){
			$res = valid_token('truban',$token);
			if(!$res){
				$this->error('请不要频繁提交！',session('trubantoken'));
			}
			$extra=session('trubantoken');
		}

		//获取信任字段id字符串
		$user = M('User')->where(array('id' => $id))->find();
		if (!$user) {
			$this->error("用户不存在！",$extra);
		}
		$trust_ids = $user['xinren'];
		$ban_ids = $user['pingbi'];
		//拆成数组
		$trust_ids_arr = explode(",",$trust_ids);
		$ban_ids_arr = explode(",",$ban_ids);
		$result=array();
		//设为信任
		if($act == '信任此用户') {
			if(in_array(userid(),$trust_ids_arr)){
				$this->error("您已信任过！",$extra);
			}else {
				//把自己的id拼入信任id字符串
				$new_trust_ids = $trust_ids.','.userid();
				$result[] = M('User')->where(array('id' => $id))->setField('xinren',$new_trust_ids);
				//把对方的id拼入我信任的id字符串
				$itrust_ids = M('User')->where(array('id' => userid()))->getField('ixinren');
				$new_itrust_ids = $itrust_ids.','.$id;
				$result[] = M('User')->where(array('id' => userid()))->setField('ixinren',$new_itrust_ids);
				if (!empty($result)) {
					$this->success("信任成功", $extra);
				} else {
					$this->error("信任失败!请重试", $extra);
				}
			}
		}
		//取消信任
		if($act == "取消信任") {
			if(!in_array(userid(),$trust_ids_arr)){
				$this->error("您没有信任过！",$extra);
			}else {
				//从信任id字符串去掉自己的id
				//$new_trust_ids = str_replace(','.userid(),'',$trust_ids);
				$new_trust_ids = $this->delID($trust_ids_arr,userid());
				$result[] = M('User')->where(array('id' => $id))->setField('xinren',$new_trust_ids);
				//把对方的id从我信任的id字符串去掉
				$itrust_ids = M('User')->where(array('id' => userid()))->getField('ixinren');
				$itrust_ids_arr = explode(",",$itrust_ids);
				$new_itrust_ids = $this->delID($itrust_ids_arr,$id);
				$result[] = M('User')->where(array('id' => userid()))->setField('ixinren',$new_itrust_ids);
				if (!empty($result)) {
					$this->success("取消信任成功", $extra);
				} else {
					$this->error("取消信任失败!请重试", $extra);
				}
			}
		}
		//设为屏蔽
		if($act == '屏蔽此用户') {
			if(in_array(userid(),$ban_ids_arr)){
				$this->error("您已屏蔽过！",$extra);
			}else {
				//把自己的id拼入屏蔽id字符串
				$new_ban_ids = $ban_ids.','.userid();
				$result[] = M('User')->where(array('id' => $id))->setField('pingbi',$new_ban_ids);
				//把对方的id拼入我屏蔽的id字符串
				$iban_ids = M('User')->where(array('id' => userid()))->getField('ipingbi');
				$new_iban_ids = $iban_ids.','.$id;
				$result[] = M('User')->where(array('id' => userid()))->setField('ipingbi',$new_iban_ids);
				if (!empty($result)) {
					$this->success("屏蔽成功", $extra);
				} else {
					$this->error("屏蔽失败!请重试", $extra);
				}
			}
		}
		//取消屏蔽
		if($act == "取消屏蔽") {
			if(!in_array(userid(),$ban_ids_arr)){
				$this->error("您没有屏蔽过！",$extra);
			}else {
				//从屏蔽id字符串去掉自己的id
				//$new_ban_ids = str_replace(','.userid(),'',$ban_ids);
				$new_ban_ids = $this->delID($ban_ids_arr,userid());
				$result = M('User')->where(array('id' => $id))->setField('pingbi',$new_ban_ids);
				//把对方的id从我信任的id字符串去掉
				$iban_ids = M('User')->where(array('id' => userid()))->getField('ipingbi');
				$iban_ids_arr = explode(",",$iban_ids);
				$new_iban_ids = $this->delID($iban_ids_arr,$id);
				$result[] = M('User')->where(array('id' => userid()))->setField('ipingbi',$new_iban_ids);
				if (!empty($result)) {
					$this->success("取消屏蔽成功", $extra);
				} else {
					$this->error("取消屏蔽失败!请重试", $extra);
				}
			}
		}
	}
	//删除字符串id中的id
	function delID($arr, $id){
		foreach($arr as $k=>$v){
			if($v == $id){
				unset($arr[$k]);
			}
		}
		return implode(",",$arr);
	}

	public function upChat($content, $chatpic="", $touid, $advid, $advtype, $token){
		$extra='';
		
		if (!userid()) {
			$this->error('您没有登录请先登录！',$extra);
		}
		
		if(!session('chattoken')) {
			set_token('chat');
		}
		if(!empty($token)){
			$res = valid_token('chat',$token);
			if(!$res){
				$this->error('请不要频繁提交！',session('chattoken'));
			}
		}
		$extra=session('chattoken');
		
		if(empty($content)){
			$this->error("请输入对话内容！",$extra);
		}
		
		if(empty($touid) || empty($advid) || !isset($advtype) || empty($token)){
			$this->error("缺少参数！",$extra);
		}
		
		if($touid==userid()){
			$this->error("这是您自己发布的广告！",$extra);
		}
		
		$time = time();
		
		if($advtype==0){
			$adv_buy = M('ad_buy')->where(array('id'=>$advid))->find();
			if(empty($adv_buy)){
				$this->error("参数错误！",$extra);
			}else{
				$order_sell = M('order_sell')->where(array('buy_bid'=>$adv_buy['id'],'sell_id'=>userid(),'status'=>array('lt',4)))->order('ctime desc')->find();
				if(empty($order_sell)){
					$temp_order_sell = M('order_temp')->where(array('ordertype'=>2,'buy_id'=>$adv_buy['userid'],'buy_bid'=>$adv_buy['id'],'sell_id'=>userid()))->find();
					if(!empty($temp_order_sell)){
						$orderid = $temp_order_sell['id'];
					}else{
						$res = M('order_temp')->add(array('ordertype'=>2,'buy_id'=>$adv_buy['userid'],'buy_bid'=>$adv_buy['id'],'sell_id'=>userid(),'ctime'=>$time));
						if(!empty($res)){
							$orderid = $res;
						}else{
							$this->error("提交失败！",$extra);
						}
					}
					$ordertype = 3;
				}else{
					$orderid = $order_sell['id'];
					$ordertype = 2;
				}
			}
		}elseif($advtype==1){
			$adv_sell = M('ad_sell')->where(array('id'=>$advid))->find();
			if(empty($adv_sell)){
				$this->error("参数错误！",$extra);
			}else{
				$order_buy = M('order_buy')->where(array('sell_sid'=>$adv_sell['id'],'buy_id'=>userid(),'status'=>array('lt',4)))->order('ctime desc')->find();
				if(empty($order_buy)){
					$temp_order_buy = M('order_temp')->where(array('ordertype'=>1,'buy_id'=>userid(),'sell_sid'=>$adv_sell['id'],'sell_id'=>$adv_sell['userid']))->find();
					if(!empty($temp_order_buy)){
						$orderid = $temp_order_buy['id'];
					}else{
						$res = M('order_temp')->add(array('ordertype'=>1,'buy_id'=>userid(),'sell_sid'=>$adv_sell['id'],'sell_id'=>$adv_sell['userid'],'ctime'=>$time));
						if(!empty($res)){
							$orderid = $res;
						}else{
							$this->error("提交失败！",$extra);
						}
					}
					$ordertype = 3;
				}else{
					$orderid = $order_buy['id'];
					$ordertype = 1;
				}
			}
		}

		$module = D('Chat');
		$result = $module->addRecord(userid(),($touid*1),$orderid,$ordertype,$content,$chatpic,$advid,$advtype);
		if(!empty($result)){
			$this->success("提交成功",$extra);
		}else{
			$this->error("提交失败！",$extra);
		}
	}
	
	public function chatPic(){
		if (!userid()) {
			$this->error('您没有登录请先登录！');
		}
		$touid = intval($_POST['touid']);
		$advid = intval($_POST['advid']);
		$advtype = intval($_POST['advtype']);
		$token = $_POST['token'];
		if(empty($touid) || empty($advid) || !isset($advtype) || empty($token)){
			$this->error("缺少参数！");
		}
		if(!session('pictoken')) {
			set_token('pic');
		}
		if(!empty($token)){
			$res = valid_token('pic',$token);
			if(!$res){
				$this->error('请不要频繁提交！');
			}
		}
		$extra=session('pictoken');
		if($touid==userid()){
			$this->error("这是您自己发布的广告！");
		}
		if(!empty($_FILES)) {
			$update = array();
			$upload = new \Think\Upload();//实列化上传类
			$upload->maxSize=3145728;//设置上传文件最大，大小
			$upload->exts= array('jpg','gif','png','jpeg');//后缀
			$upload->rootPath ='./Upload/lanch/chat/';//上传目录
			$upload->savePath      =  ''; // 设置附件上传（子）目录
			$upload->autoSub     = true;
			$upload->subName     = array('date','Ymd');
			$upload->saveName = array('uniqid','');//设置上传文件规则
			$info= $upload->upload();//执行上传方法
			if($info){
				$image = new \Think\Image();
				foreach($info as $key=>$file){
					if(!empty($file)){
						$image->open('./Upload/lanch/chat/'.$file['savepath'].$file['savename']);
						$width = $image->width();
						$height = $image->height();
						if(empty($width) || empty($height)){
							$bili = 1;
						}else{
							$bili = intval($width/$height);
						}
						$new_width = 600;
						$new_height = intval($new_width/$bili);
						// 按照原图的比例生成一个最大宽度为600像素的缩略图并删除原图
						$image->thumb($new_width, $new_height)->save('./Upload/lanch/chat/'.$file['savepath']."s_".$file['savename']);
						unlink('./Upload/lanch/chat/'.$file['savepath'].$file['savename']);
					}
				}
			}
			if(!empty($info['upchatpic']['savename'])){
				$chatpic = '/Upload/lanch/chat/'.$info['upchatpic']['savepath']."s_".$info['upchatpic']['savename'];
				$time = time();
				if($advtype==0){
					$adv_buy = M('ad_buy')->where(array('id'=>$advid))->find();
					if(empty($adv_buy)){
						$this->error("参数错误！");
					}else{
						$order_sell = M('order_sell')->where(array('buy_bid'=>$adv_buy['id'],'sell_id'=>userid(),'status'=>array('lt',4)))->order('ctime desc')->find();
						if(empty($order_sell)){
							$temp_order_sell = M('order_temp')->where(array('ordertype'=>2,'buy_id'=>$adv_buy['userid'],'buy_bid'=>$adv_buy['id'],'sell_id'=>userid()))->find();
							if(!empty($temp_order_sell)){
								$orderid = $temp_order_sell['id'];
							}else{
								$res = M('order_temp')->add(array('ordertype'=>2,'buy_id'=>$adv_buy['userid'],'buy_bid'=>$adv_buy['id'],'sell_id'=>userid(),'ctime'=>$time));
								if(!empty($res)){
									$orderid = $res;
								}else{
									$this->error("提交失败！");
								}
							}
							$ordertype = 3;
						}else{
							$orderid = $order_sell['id'];
							$ordertype = 2;
						}
					}
				}elseif($advtype==1){
					$adv_sell = M('ad_sell')->where(array('id'=>$advid))->find();
					if(empty($adv_sell)){
						$this->error("参数错误！");
					}else{
						$order_buy = M('order_buy')->where(array('sell_sid'=>$adv_sell['id'],'buy_id'=>userid(),'status'=>array('lt',4)))->order('ctime desc')->find();
						if(empty($order_buy)){
							$temp_order_buy = M('order_temp')->where(array('ordertype'=>1,'buy_id'=>userid(),'sell_sid'=>$adv_sell['id'],'sell_id'=>$adv_sell['userid']))->find();
							if(!empty($temp_order_buy)){
								$orderid = $temp_order_buy['id'];
							}else{
								$res = M('order_temp')->add(array('ordertype'=>1,'buy_id'=>userid(),'sell_sid'=>$adv_sell['id'],'sell_id'=>$adv_sell['userid'],'ctime'=>$time));
								if(!empty($res)){
									$orderid = $res;
								}else{
									$this->error("提交失败！");
								}
							}
							$ordertype = 3;
						}else{
							$orderid = $order_buy['id'];
							$ordertype = 1;
						}
					}
				}
				$module = D('Chat');
				$result = $module->addRecord(userid(),($touid*1),$orderid,$ordertype,"",$chatpic,$advid,$advtype);
				if(!empty($result)){
					header('Location:/Newad/upload.html?touid='.$touid.'&advid='.$advid.'&advtype='.$advtype);
				}else{
					$this->error("提交失败！");
				}
			}else{
				$this->error("上传失败！");
			}
		}else{
			$this->error("请选择文件！");
		}
	}
	
	private function getadvno(){
		$code = '';
		for($i=1;$i<=5;$i++){
			$code .= chr(rand(97,122));
		}
		$adv_no = $code.time();
		$advbuy = M('ad_buy')->where(array('ad_no'=>$adv_no))->find();
		$advsell = M('ad_sell')->where(array('ad_no'=>$adv_no))->find();
		if(!empty($advbuy) || !empty($advsell)){
			$this->getadvno();
		}else{
			return $adv_no;
		}
	}
	
	public function upload(){
		$touid = intval($_GET['touid']);
		$advid = intval($_GET['advid']);
		$advtype = intval($_GET['advtype']);
		$this->assign('touid',$touid);
		$this->assign('advid',$advid);
		$this->assign('advtype',$advtype);
		//生成token
		$pic_token = set_token('pic');
		$this->assign('pic_token',$pic_token);
		$this->display();
	}
}