<?php
/**
 * Created by JetBrains PhpStorm.
 * User: seaman
 * Date: 5/14/13
 * Time: 2:35 PM
 * To change this template use File | Settings | File Templates.
 */

    require('define.php');
    include('php/Logger.php');
    Logger::configure('config.xml');
    $log = Logger::getLogger("main");
    if(empty($log)){
        exit();
    }

    $callback = $_GET["callback"];


    //查询接口
    //上行参数 apk版本号/资源版本号/系统类型
    //1.android/ios
    if(empty($_GET["appversion"]) || empty($_GET["version"])  || empty($_GET["innerversion"])  ||empty($_GET["type"]) ){
        resultReturn("","","","",false);
        exit();
    }

    $wgtVersion = $_GET["appversion"]; //资源版本号
    $packageVersion = $_GET["version"]; //整包版本号
    $innerVersion = $_GET["innerversion"];  //基座版本号，用不上
    $type = strtolower($_GET["type"]);  //基座版本号，用不上

    $log->info("[REQUEST] wgetVersion:" . $wgtVersion . " packageVersion:" . $packageVersion . " innerVersion:" .$innerVersion );

    //读取最新版本信息

//2.apk版本号是否一致
//3.资源版本号是否一致
//4.返回值的
/*
{
    download_url_base:"http://www",
    download_url_app:"",
    type:"Android",
    releasenotes:"",
}
*/


    if($type == "ios"){
        if(P_CSDN_IOS_VERSION != $packageVersion){
            $log->info("IOS版本低，需要升级，目前最新版本" . P_CSDN_IOS_VERSION);
            resultReturn(P_CSDN_IOS_URL,"","iOS",P_CSDN_IOS_RELEASENOTE,P_CSDN_IOS_FORCE);
        }else if(P_CSDN_IOS_WGT_VERSION != $wgtVersion){
            $log->info("IOS WGT 版本低，需要升级，目前最新版本" . P_CSDN_IOS_WGT_VERSION);

            $URL = P_CSDN_ANDROID_WGT_URL; //TODO 将来要废弃 做patch 版本
            resultReturn("",P_CSDN_ANDROID_WGT_URL,"ios",P_CSDN_IOS_RELEASENOTE,P_CSDN_IOS_WGT_FORCE);
        }else {
            //不需要升级任何东西
            resultReturn("","","","",false);
        }
    }else if($type == "android"){
        if(P_CSDN_ANDROID_VERSION != $packageVersion){
            $log->info("ANDROID版本低，需要升级，目前最新版本" . P_CSDN_ANDROID_VERSION);
            resultReturn(P_CSDN_ANDROID_URL,"","iOS",P_CSDN_ANDROID_RELEASENOTE,P_CSDN_ANDROID_FORCE);
        }else if(P_CSDN_ANDROID_WGT_VERSION != $wgtVersion){
            $log->info("ANDROID WGT 版本低，需要升级，目前最新版本" . P_CSDN_ANDROID_WGT_VERSION);

            $URL = P_CSDN_ANDROID_WGT_URL; //TODO 将来要废弃 做patch 版本
            resultReturn("",P_CSDN_ANDROID_WGT_URL,"android",P_CSDN_ANDROID_RELEASENOTE,P_CSDN_ANDROID_WGT_FORCE);
        }else {
            //不需要升级任何东西
            resultReturn("","","","",false);
        }
    }


    function resultReturn($download_url_base,$download_url_app,$type,$releasenotes,$force){
        global $log;
        global $callback;

        $return_result = array('download_url_base' => $download_url_base, 'download_url_app' => $download_url_app,
            'type' => $type, 'releasenotes' => $releasenotes, 'force' => $force);
        $return_json = json_encode($return_result);

        $log->info("[RESPONSE]" . $return_json);
        echo $callback . "(" .$return_json . ")";
    }