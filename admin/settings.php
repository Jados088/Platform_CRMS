<?php require __DIR__.'/../includes/app.php'; need('System Administrator');
if($_SERVER['REQUEST_METHOD']==='POST'){chk();foreach($_POST['s']??[] as $id=>$v)q('UPDATE system_settings SET setting_value=?,updated_by=? WHERE setting_id=?',[$v,user()['id'],$id]);audit('settings','settings','');flash('Settings saved.');header('Location: settings.php');exit;}
head('System settings');?><div class="card"><div class="card-body"><form method="post" class="row g-3"><?=csrf_f()?>
<?php foreach(q('SELECT * FROM system_settings WHERE is_sensitive=0')->fetchAll() as $x)fld('s['.$x['setting_id'].']',$x['description']?:$x['setting_key'],$x['setting_value'],'text',null,'col-md-6');?>
<div class="col-12"><button class="btn btn-primary">Save settings</button></div></form></div></div><?php foot();
