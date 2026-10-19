<?php
require __DIR__.'/../includes/app.php';
$isAjaxRequest=strtolower($_SERVER['HTTP_X_REQUESTED_WITH']??'')==='xmlhttprequest';
if(!user()){
    if($isAjaxRequest&&$_SERVER['REQUEST_METHOD']==='POST'){
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok'=>false,'message'=>'Your session has expired. Sign in again to open notifications.']);
        exit;
    }
    need();
}

function notification_json_response($status,$payload){
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload,JSON_UNESCAPED_SLASHES);
    exit;
}

function notification_return_location(){
    $referer=$_SERVER['HTTP_REFERER']??'';
    $refererHost=parse_url($referer,PHP_URL_HOST);
    $requestHost=parse_url('http://'.($_SERVER['HTTP_HOST']??''),PHP_URL_HOST);
    $path=parse_url($referer,PHP_URL_PATH);
    $basePath=rtrim((string)parse_url(BASE,PHP_URL_PATH),'/').'/';
    if(!$refererHost||!$requestHost||strcasecmp($refererHost,$requestHost)!==0||!$path||substr($path,0,strlen($basePath))!==$basePath){
        return BASE.'shared/notifications.php';
    }
    $query=parse_url($referer,PHP_URL_QUERY);
    return $path.($query?'?'.$query:'');
}

if($_SERVER['REQUEST_METHOD']==='POST'){
    $action=$_POST['action']??'';
    if($action==='open_notification'){
        if(!hash_equals(csrf(),$_POST['t']??'')){
            notification_json_response(403,['ok'=>false,'message'=>'Your session token expired. Refresh the page and try again.']);
        }
        $notificationId=(int)($_POST['id']??0);
        $notification=q("SELECT notification_id,related_entity_type,related_entity_id FROM notifications WHERE notification_id=? AND user_id=? AND channel='in_app'",[$notificationId,user()['id']])->fetch();
        if(!$notification){
            if($isAjaxRequest)notification_json_response(404,['ok'=>false,'message'=>'Notification not found.']);
            flash('Notification not found.','warning');
            header('Location: notifications.php');
            exit;
        }
        q("UPDATE notifications SET status='read',read_at=NOW() WHERE notification_id=? AND user_id=? AND channel='in_app'",[$notificationId,user()['id']]);
        $destination=notification_link($notification);
        $unreadCount=(int)one("SELECT COUNT(*) FROM notifications WHERE user_id=? AND channel='in_app' AND status<>'read'",[user()['id']]);
        if($isAjaxRequest)notification_json_response(200,['ok'=>true,'destination'=>$destination,'unread_count'=>$unreadCount]);
        header('Location: '.($destination??notification_return_location()));
        exit;
    }
    chk();
    if($action==='read_all'){
        q("UPDATE notifications SET status='read',read_at=NOW() WHERE user_id=? AND channel='in_app' AND status<>'read'",[user()['id']]);
    }elseif($action==='read_one'){
        q("UPDATE notifications SET status='read',read_at=NOW() WHERE notification_id=? AND user_id=? AND channel='in_app'",[(int)($_POST['id']??0),user()['id']]);
    }else{
        flash('Invalid notification action.','danger');
        header('Location: notifications.php');
        exit;
    }
    header('Location: notifications.php');
    exit;
}

$notifications=q('SELECT notification_id,notification_type,subject,message,related_entity_type,related_entity_id,status,created_at FROM notifications WHERE user_id=? AND channel=\'in_app\' ORDER BY notification_id DESC LIMIT 100',[user()['id']])->fetchAll();
$unreadCount=(int)one("SELECT COUNT(*) FROM notifications WHERE user_id=? AND channel='in_app' AND status<>'read'",[user()['id']]);
head('Notifications');
?>
<div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
    <p class="text-muted mb-0">Updates and actions relevant to your account and responsibilities.</p>
    <?php if($unreadCount):?><form method="post"><?=csrf_f()?><input type="hidden" name="action" value="read_all"><button class="btn btn-sm btn-outline-secondary">Mark all as read</button></form><?php endif;?>
</div>
<?php if(!$notifications):?>
    <div class="card"><div class="card-body text-center text-muted py-5"><i class="bi bi-bell fs-3 d-block mb-2"></i>You have no notifications.</div></div>
<?php else:?>
    <div class="list-group notification-list">
    <?php foreach($notifications as $notification):?>
        <?php $notificationTarget=notification_link($notification);?>
        <div class="list-group-item notification-row<?=$notification['status']==='read'?'':' unread'?>">
            <form method="post" action="<?=BASE?>shared/notifications.php" class="notification-open-list-form" data-notification-form>
                <?=csrf_f()?><input type="hidden" name="action" value="open_notification"><input type="hidden" name="id" value="<?=e($notification['notification_id'])?>">
                <button type="submit" class="notification-row-button" aria-label="<?=e($notification['subject']?:'Update')?><?=e($notificationTarget?'':' (mark read only)')?>">
                    <span class="notification-row-copy"><strong><?=e($notification['subject']?:'Update')?></strong><span><?=e($notification['message'])?></span><small><?=e($notification['created_at'])?></small></span>
                    <span class="notification-open-label"><?=$notificationTarget?'Open':'Mark read only'?> <i class="bi bi-arrow-up-right"></i></span>
                </button>
            </form>
            <?php if($notification['status']!=='read'):?><form method="post"><?=csrf_f()?><input type="hidden" name="action" value="read_one"><input type="hidden" name="id" value="<?=$notification['notification_id']?>"><button class="btn btn-sm btn-outline-secondary">Mark read</button></form><?php endif;?>
        </div>
    <?php endforeach;?>
    </div>
<?php endif;?>
<?php foot(); ?>
