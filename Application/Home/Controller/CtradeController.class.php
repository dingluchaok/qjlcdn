<?php
namespace Home\Controller;
class CtradeController extends HomeController
{
	public function index($type=0){
		if($type != 0 && $type != 1){
			$this->error("广告类型错误！");
		}
		//认证商家订单
		$seller_ids = M('seller_apply')->where(array('status'=>1))->getField('uid', true);
		$where2=array();
		$where2['a.userid'] = array('in', $seller_ids);
		$c_show_check = M('config')->where(array('id'=>1))->getField('c_show_check');
		if($c_show_check == 1){
			$where2['a.is_check'] = 1;
		}
		$where2['a.state'] = 1;
		if($_GET){
			$obj=$_GET['obj'];$coin=$_GET['coin'];$loca=$_GET['loca'];$curr=$_GET['curr'];$paym=$_GET['paym'];$uname=$_GET['uname'];
			if (checkstr($coin) ||checkstr($loca) || checkstr($curr) || checkstr($paym) || checkstr($uname)) {
				$this->error('您输入的信息有误！');
			}
			if($obj==1){
				if($coin != ''){$where2['a.coin'] = $coin;}
				if($loca != ''){$where2['a.location'] = $loca;}
				if($curr != ''){$where2['a.currency'] = $curr;}
				if($paym != ''){$where2['a.pay_method'] = $paym;}
			}elseif($obj==2){
				if($uname != ''){$where2['b.enname'] = $uname;}
			}
		}
		$Module = ($type == 0)?M('Ad_buy a'):M('Ad_sell a');
		$where2['c.trade_on'] = 0;
		$count=0;
		//$Page = new \Think\Page($count, 10);
		//$show = $Page->show();
		$list2 = $Module->field('a.*')->join('mollymobi_coin c on c.id=a.coin','LEFT')->where($where2)->order('a.price asc')->select();
		foreach ($list2 as $k => $v) {
			$list2[$k]['coin'] = M('Coin')->where(array('id'=>$v['coin']))->getField('name');
			$list2[$k]['location'] = M('Location')->where(array('id'=>$v['location']))->getField('short_name');
			$list2[$k]['currency_type'] = get_price($v['coin'],$v['currency'],0);
			if($v['is_margin'] == 1) {
				$price = get_price($v['coin'],$v['currency'],1);
				if($price < $list2[$k]['min_price']){
					$price = $list2[$k]['min_price'];
				}
				$list2[$k]['price'] = round($price + $price * $v['margin']/100,2);
			}
			$list2[$k]['pay_method'] = M('PayMethod')->where(array('id'=>$v['pay_method']))->getField('img');
			$adverinfo = M('User')->where(array('id'=>$v['userid']))->find();
			$list2[$k]['avatar'] = $adverinfo['avatar'];
			$list2[$k]['enname'] = $adverinfo['username'];
			$list2[$k]['transact'] = $adverinfo['transact'];
			$list2[$k]['goodcomm'] = $adverinfo['goodcomm'];
			$list2[$k]['trust'] = gettrust($adverinfo['id']);
			$list2[$k]['headpic'] = headimg($adverinfo['id']);
		}
		$this->assign('list2', $list2);
		$where=array();
		$where['a.userid'] = array('not in', $seller_ids);
		$c_show_check = M('config')->where(array('id'=>1))->getField('c_show_check');
		if($c_show_check == 1){
			$where['a.is_check'] = 1;
		}
		$where['a.state'] = 1;
		if($_GET){
			$obj=$_GET['obj'];$coin=$_GET['coin'];$loca=$_GET['loca'];$curr=$_GET['curr'];$paym=$_GET['paym'];$uname=$_GET['uname'];
			if (checkstr($coin) ||checkstr($loca) || checkstr($curr) || checkstr($paym) || checkstr($uname)) {
				$this->error('您输入的信息有误！');
			}
			if($obj==1){
				if($coin != ''){$where['a.coin'] = $coin;}
				if($loca != ''){$where['a.location'] = $loca;}
				if($curr != ''){$where['a.currency'] = $curr;}
				if($paym != ''){$where['a.pay_method'] = $paym;}
			}elseif($obj==2){
				if($uname != ''){$where['b.enname'] = $uname;}
			}
		}
		$Module = ($type == 0)?M('Ad_buy a'):M('Ad_sell a');
		$where['c.trade_on'] = 0;
		$count=$Module->field('a.*')->join('mollymobi_coin c on c.id=a.coin','LEFT')->where($where)->order('a.price asc')->limit($Page->firstRow . ',' . $Page->listRows)->count();	
		$Page = new \Think\Page($count, 20);
		$show = $Page->show();
		$list = $Module->field('a.*')->join('mollymobi_coin c on c.id=a.coin','LEFT')->where($where)->order('a.price asc')->limit($Page->firstRow . ',' . $Page->listRows)->select();
		foreach ($list as $k => $v) {
			$list[$k]['coin'] = M('Coin')->where(array('id'=>$v['coin']))->getField('name');
			$list[$k]['location'] = M('Location')->where(array('id'=>$v['location']))->getField('short_name');
			$list[$k]['currency_type'] = get_price($v['coin'],$v['currency'],0);
			if($v['is_margin'] == 1) {
				$price = get_price($v['coin'],$v['currency'],1);
				if($price < $list[$k]['min_price']){
					$price = $list[$k]['min_price'];
				}
				$list[$k]['price'] = round($price + $price * $v['margin']/100,2);
			}
			$list[$k]['pay_method'] = M('PayMethod')->where(array('id'=>$v['pay_method']))->getField('img');
			$adverinfo = M('User')->where(array('id'=>$v['userid']))->find();
			$list[$k]['avatar'] = $adverinfo['avatar'];
			$list[$k]['enname'] = $adverinfo['username'];
			$list[$k]['transact'] = $adverinfo['transact'];
			$list[$k]['goodcomm'] = $adverinfo['goodcomm'];
			$list[$k]['trust'] = gettrust($adverinfo['id']);
			$list[$k]['headpic'] = headimg($adverinfo['id']);
		}	
		$coin = M('Coin')->field('id,title,js_yw,name,img')->where(array('status'=>1,'name'=>array('neq','cny'),'trade_on'=>0))->select();
		$this->assign('coin', $coin);
	
		$location = M('Location')->select();
		$this->assign('location', $location);
	
		$currency = M('Btc')->select();
		$this->assign('currency', $currency);
	
		$pay_method = M('PayMethod')->select();
		$this->assign('pay_method', $pay_method);
	
		$this->assign('type', $type);
		$this->assign('list', $list);
		$this->assign('page', $show);
		//明星排行榜
		$users = M('user')->field('id, username')->order("LENGTH(trade_id) DESC")->limit(5)->select();
		foreach($users as $k=>$v) {
			$users[$k]['trade_amount'] = gettrade($v['id']);
			$users[$k]['trade_money'] = gettrademoney($v['id']);
			$users[$k]['trust'] = gettrust($v['id']);
			$users[$k]['img'] = headimg($v['id']);
		}
		$this->assign('users', $users);
		//最新交易
		$newtrade = M('order_buy')->field('a.finished_time, b.username')->alias('a')->join('__USER__ b on a.sell_id=b.id')->where(array('a.status'=>array('in', array(3, 4))))->limit(10)->select();
		foreach($newtrade as $k=>$v) {
			$newtrade[$k]['time'] = timediff($v['finished_time'], time());
		}
		$this->assign('newtrade', $newtrade);//dump($list2);dump($list);
		$this->display();
	}
}