<?php
require __DIR__.'/../includes/app.php';
need();

if($_SERVER['REQUEST_METHOD']==='POST'){
    chk();
    $action=$_POST['action']??'';
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
        <div class="list-group-item notification-row<?=$notification['status']==='read'?'':' unread'?>">
            <div class="d-flex justify-content-between align-items-start gap-3">
                <div class="min-width-0">
                    <div class="fw-semibold"><?=e($notification['subject']?:'Update')?></div>
                    <p class="mb-1"><?=e($notification['message'])?></p>
                    <small class="text-muted"><?=e($notification['created_at'])?></small>
                </div>
                <div class="d-flex flex-shrink-0 gap-2">
                    <a class="btn btn-sm btn-outline-primary" href="<?=e(notification_link($notification))?>">Open</a>
                    <?php if($notification['status']!=='read'):?><form method="post"><?=csrf_f()?><input type="hidden" name="action" value="read_one"><input type="hidden" name="id" value="<?=$notification['notification_id']?>"><button class="btn btn-sm btn-outline-secondary">Mark read</button></form><?php endif;?>
                </div>
            </div>
        </div>
    <?php endforeach;?>
    </div>
<?php endif;?>
<?php foot(); ?>
