<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset TrackEd password</title>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f6f8;color:#20242a;margin:0;padding:24px}
    main{max-width:420px;margin:8vh auto;background:#fff;padding:28px;border-radius:14px;box-shadow:0 8px 32px #17202a18}
    h1{font-size:24px;margin:0 0 8px}p{color:#5d6670;line-height:1.5}
    label{display:block;font-weight:700;margin:18px 0 6px}
    input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #cbd2d9;border-radius:8px;font-size:16px}
    button{width:100%;padding:13px;margin-top:22px;border:0;border-radius:8px;background:#2a76c9;color:#fff;font-size:16px;font-weight:700}
    button:disabled{opacity:.65}#status{margin-top:16px}#status.error{color:#b42318}#status.success{color:#187443}
  </style>
</head>
<body>
  <main>
    <h1>Reset your password</h1>
    <p>Choose a new password for your TrackEd account. The link can only be used once and expires after 60 minutes.</p>
    <form id="reset-form">
      <label for="password">New password</label>
      <input id="password" name="password" type="password" minlength="8" autocomplete="new-password" required>
      <label for="password_confirmation">Confirm new password</label>
      <input id="password_confirmation" name="password_confirmation" type="password" minlength="8" autocomplete="new-password" required>
      <input id="email" name="email" type="hidden" value="{{ $email }}">
      <input id="token" name="token" type="hidden" value="{{ $token }}">
      <button id="submit" type="submit">Reset password</button>
    </form>
    <p id="status" role="status" aria-live="polite"></p>
  </main>
  <script>
    const form=document.getElementById('reset-form');
    const button=document.getElementById('submit');
    const status=document.getElementById('status');
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      button.disabled=true;
      status.className='';
      status.textContent='Updating your password…';
      try{
        const response=await fetch(@json(url('/api/auth/reset-password')),{
          method:'POST',
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify({
            email:document.getElementById('email').value,
            token:document.getElementById('token').value,
            password:document.getElementById('password').value,
            password_confirmation:document.getElementById('password_confirmation').value,
          }),
        });
        const data=await response.json();
        if(!response.ok) throw new Error(data.error||'Unable to reset your password. Request a new link and try again.');
        form.remove();
        status.className='success';
        status.textContent=data.message;
      }catch(error){
        status.className='error';
        status.textContent=error.message||'Unable to reset your password. Please try again.';
        button.disabled=false;
      }
    });
  </script>
</body>
</html>
