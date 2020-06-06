<?php
// +----------------------------------------------------------------------
// | YFCMF [ WE CAN DO IT MORE SIMPLE ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2018 http://www.rainfer.net All rights reserved.
// +----------------------------------------------------------------------
// | Author: Ice <190520601@qq.com>
// +----------------------------------------------------------------------

namespace Home\Controller;

use Think\Controller;

class KLineController extends Controller
{


    /**
     * @return string
     * info: config-配置
     */
    public function Config()
    {
        $respondContent['exchanges'] = [
//            ["value"=>"", "name"=>"All Exchanges", "desc"=>""],
//            ["value"=>"NasdaqNM", "name"=> "NasdaqNM", "desc"=>"NasdaqNM"],
//            ["value"=>"NYSE", "name"=>"NYSE", "desc"=>"NYSE"],
//            ["value"=>"NCM", "name"=> "NCM", "desc"=> "NCM"]
        ]; // 交易所数组
        //$respondContent['supported_resolutions'] = [1, 5, 10, 30, 60, 240, '1D', '5D', '1W']; // 分辨率
        $respondContent['supports_group_request'] = false;
        $respondContent['supports_marks'] = false;
        $respondContent['supports_search'] = true;// 是否支持搜索
        $respondContent['supports_time'] = true; // 是否传递一次服务器时间
        $respondContent['supports_timescale_marks'] = false;
        $respondContent['symbols_types'] = [
//            ["name"=> "All types", "value"=> ""],
            ["name"=> "Stock", "value"=>"stock"],
//            ["name"=> "Index", "value"=> "index"]
        ];

        return $this->resJson($respondContent);
    }

    /**
     * @return int
     * info: 服务器当前时间
     */
    public function time()
    {
        echo NOW_TIME;
    }

    /**
     * @return string
     * info: symbol参数配置
     * api：https://zlq4863947.gitbooks.io/tradingview/book/Symbology.html#supportedresolutions
     */
    public function symbols()
    {
        $symbol = I('symbol','');
        $respondContent['description'] = $symbol;
        $respondContent['exchange - listed'] = ""; // 次参数开启，才会调用history方法
        $respondContent['exchange - traded'] = "";
        $respondContent['supported_resolutions'] = ["1","5","15","30","60","120","240","480","D"]; // 分辨率
        $respondContent['currency_code']=$symbol;
        $respondContent['has_intraday'] = true; // 屏幕可选分辨率
        $respondContent['has_no_volume']=false;
        $respondContent['volume_precision'] = 6;
        $respondContent['pointvalue']=1;
        $respondContent['pricescale']=100;
        $respondContent['minmov'] = 1;
        $respondContent['minmov2'] = 0;
        $respondContent['name'] = $symbol;
        $respondContent['session'] = "24x7";
        $respondContent['ticker'] = $symbol; // 该参数会直接影响k线图获取哪个标
        $respondContent['timezone'] = "Asia / Shanghai";
        $respondContent['type'] = "stock";
        return $this->resJson($respondContent);

    }

    /**
     * @return string
     * info : k线图-数据
     * 2018-05-21 11:54:33--2018-09-18 11:55:33
     * cat:2018-05-21 11:57:08--2018-09-18 11:58:08
     */
    public function history2()
    {
        //分钟间隔
        $timeShare = I('resolution', 15);
        $bid = strtolower(I('symbol', ''));
        $from = I('from', 0);
        $to = I('to', 0);
        if ($timeShare == 'D') {
            $timeShare = 60*24;
        }
        //步长 秒
        $step=$timeShare*60;
        $data = M('TradeLog')->where(array(
            'market'  => $bid,
            'status'   =>1,
            'addtime' => array('between', array($from,$to))
        ))->select();
        //dump($data);die;

        if(in_array($timeShare,[1,5,15,30])){
            $from=strtotime(date('Y-m-d H:i:00',$from));
            $fen=(int)date('i',$from);
            $cha=$fen % $timeShare;
            $start=$from-$cha*60;
        }elseif ($timeShare==60){
            $start=strtotime(date('Y-m-d H:00:00',$from));
        }elseif ($timeShare==60*24){
            $start=strtotime(date('Y-m-d 00:00:00',$from));
        }
        $respondContent['t'] = [];
        $respondContent['c'] = [];
        $respondContent['h'] = [];
        $respondContent['l'] = [];
        $respondContent['o'] = [];
        $respondContent['v'] = [];
        if (empty($data)) {
            $respondContent['s'] = 'no_data'; // ok|error|no_data
            return $this->resJson($respondContent);
        }
        $max_price=$min_price=$data[0]['price'];
        for ( $i = $start; $i <= $to; $i = $i + $step ){
            $trans_amount=0;
            $tmp=0;
            $open_price = $close_price = 0;
            foreach ($data as $key => $val) {
                if($val['addtime']>$i && $val['addtime']<=$i+$step){
                    if($val['price']>$max_price)$max_price=$val['price'];
                    if($val['price']<$min_price)$min_price=$val['price'];
                    $trans_amount+=$val['num'];
                    if($tmp==0)$open_price=$val['price'];
                    $close_price=$val['price'];
                    $tmp++;
                    //删除已使用的提高效率
                    unset($data[$key]);
                }
            }
            array_push($respondContent['t'], (int)($start+$step));
            array_push($respondContent['h'], (float) $max_price);
            array_push($respondContent['c'], (float) $close_price);
            array_push($respondContent['l'], (float) $min_price);
            array_push($respondContent['o'], (float) $open_price);
            array_push($respondContent['v'], (float) $trans_amount);
        }
        $respondContent['s'] = 'ok'; // ok|error|no_data
        return $this->resJson($respondContent);
    }
	public function history()
    {
        // date
        $timeShare = I('resolution', 15);
        $bid = strtolower(I('symbol', ''));
        $from = I('from', 0);
        $to = I('to', 0);

        if ($timeShare == 'D') {
            $timeShare = 60*24;
        }
        //步长 秒
        $step=$timeShare*60;

        if(in_array($timeShare,[1,5,15,30])){
            $from=strtotime(date('Y-m-d H:i:00',$from));
            $fen=(int)date('i',$from);
            $cha=$fen % $timeShare;
            $start=$from-$cha*60;
        }elseif ($timeShare==60){
            $start=strtotime(date('Y-m-d H:00:00',$from));
        }elseif ($timeShare==60*24){
            $start=strtotime(date('Y-m-d 00:00:00',$from));
        }else{
            $start=strtotime(date('Y-m-d H:00:00',$from));
        }

        $params = $timeShare . ' ' . $bid . ' ' .$from.' '.$to.' '.$start.' '.$step;
        $path="python ".dirname(__FILE__)."\\runtrade\\task.py ";
        @passthru($path . $params);
        exit;


        //分钟间隔
        $timeShare = I('resolution', 15);
        $bid = strtolower(I('symbol', ''));
        $from = I('from', 0);
        $to = I('to', 0);
        if ($timeShare == 'D') {
            $timeShare = 60*24;
        }
        //步长 秒
        $step=$timeShare*60;
        $data = M('TradeLog')->where(array(
            'market'  => $bid,
            'status'   =>1,
            'addtime' => array('between', array($from,$to))
        ))->order('addtime desc')->limit(0,10000)->select();
        //dump($data);

        if(in_array($timeShare,[1,5,15,30])){
            $from=strtotime(date('Y-m-d H:i:00',$from));
            $fen=(int)date('i',$from);
            $cha=$fen % $timeShare;
            $start=$from-$cha*60;
        }elseif ($timeShare==60){
            $start=strtotime(date('Y-m-d H:00:00',$from));
        }elseif ($timeShare==60*24){
            $start=strtotime(date('Y-m-d 00:00:00',$from));
        }else{
            $start=strtotime(date('Y-m-d H:00:00',$from));
        }
        $respondContent['t'] = [];
        $respondContent['c'] = [];
        $respondContent['h'] = [];
        $respondContent['l'] = [];
        $respondContent['o'] = [];
        $respondContent['v'] = [];
        if (empty($data)) {
            $respondContent['s'] = 'no_data'; // ok|error|no_data
            return $this->resJson($respondContent);
        }
        //$max_price=$min_price=$data[0]['price'];
        // $params = str_replace('"', "'",  "$start $to $step ".json_encode($data, true)." ".json_encode($respondContent, true));

        // file_put_contents(dirname(__FILE__)."\json.txt", $params);
        
        // $path="C:\Windows\python-3.8.3-embed-win32\python ".dirname(__FILE__)."\call.py "; //需要注意的是：末尾要加一个空格

        // $wk = @exec($path);

        // echo $wk;

        // exit;

        

        
        for ( $i = $start; $i <= $to; $i = $i + $step ){
            $trans_amount=0;
            $max_price=0;$min_price=0;
            $tmp=0;
            $open_price = $close_price = 0;
            foreach ($data as $key => $val) {
                if ($val['addtime'] > $i && $val['addtime'] <= $i + $step) {
                    if ($val['price'] > $max_price) $max_price = $val['price'];
                    if ($min_price == 0) {
                        $min_price = $val['price'];
                    } elseif ($val['price'] < $min_price) {
                        if ($val['price'] < $min_price) $min_price = $val['price'];
                    }
                    $trans_amount += $val['num'];
                    if ($tmp == 0) $open_price = $val['price'];
                    $close_price = $val['price'];
                    $tmp++;
                    //删除已使用的提高效率
                    unset($data[$key]);
                }
            }
            if($max_price==0 && $min_price ==0){

            }
            array_push($respondContent['t'], ($i+$step));
            array_push($respondContent['h'], $max_price);
            array_push($respondContent['c'], $close_price);
            array_push($respondContent['l'], $min_price);
            array_push($respondContent['o'], $open_price);
            array_push($respondContent['v'], $trans_amount);
        }
        $respondContent['s'] = 'ok'; // ok|error|no_data
        return $this->resJson($respondContent);
    }
    private function resJson($arr)
    {
        echo json_encode($arr);
    }


}