//chrome.extension.getURL("images/myimage.png")

function checkTitle(){
	if(document.body){
		if(document.title == '金中成绩查询'){
			// 另一个扩展 Javascript 已经接管页面
			console.error('Attempting to start an instance while another instance exists already');
		}else{
			document.title = '金中成绩查询';
			startExecution();
		}
	}else{
		setTimeout(checkTitle, 50);
	}
};
checkTitle();

function parseQuery(a){
	var queryString = {};
	(a || '').replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		function($0, $1, $2, $3) { queryString[$1] = $3; }
	);
	return queryString;
}

// Pop state support
window.onpopstate = function(e) {
	var f = function(){
		c++;
		if(document.title !== '金中成绩查询' && c<10){
			setTimeout(f, 50);
			return;
		}

		var q = parseQuery(e.state);
		var $radio = $('#exam-control').find('input[value='+q['kaoshi']+']').attr('checked', true);

		if(window.sessionStorage && sessionStorage['result_error']){
			if(sessionStorage['result_error'] == 'cert'){
				$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>考生信息错误 :( 。</strong>检查下再试试吧。</div>');
				var $form_stuinfo = $('#form-stuinfo').children('div').addClass('error').one('change', 'input', function(){
					// $('#result_error').remove();
					// 暂时注释掉避免降低用户体验
					$form_stuinfo.removeClass('error');
				});
			}else{
				$('h1:first').after('<div id="result_error" class="alert alert-error" title="肯定会有的，只是等多久的问题 :)">查不到 <strong>'+ $radio.parent().text() +'</strong> 的数据。</div>');
				$radio.parent().append('<span class="help-inline">无成绩数据</span>');
				$('#exam-control').addClass('error').one('change', 'input', function(){
					// $('#result_error').remove();
					// 暂时注释掉避免降低用户体验
					$('#exam-control').removeClass('error');
				});
			}
			delete sessionStorage['result_error'];
		}
	}, c = 0;
	f();
};

function startExecution(){
	$(function(){
		if(document.body.innerText.indexOf('您未被授权查看该页') != -1){
			errorPage();
			return;
		}

		var exam_list = {};
		var $kaoshi = $('#kaoshi'), $kaoshi_new;
		$kaoshi.find('option').each(function(){
			exam_list[$(this).attr('value')] = $(this).text().replace(/(\s)/g,'');
		});


		for(var i in exam_list){
			var $eln = $('<label class="radio"><input type="radio" name="kaoshi" value="'+i+'"> '+exam_list[i]+'</label>');
			if($kaoshi_new){
				$kaoshi_new.after($eln);
			}else{
				$kaoshi_new = $eln;
			}
		}

		var $f = $('form:first'),
			update_status_t = $f.find('b').text().replace(/(\s)/g,'').replace(/\(/g, '（').replace(/\)/g, '）'),
			orig_announcement_t = $f.next().text()
				.replace(/(\s)(\s)+/g,'$1')
				.replace(/．/g, '。')
				.replace(/,/g, '，')
				.replace(/;/g, '；')
				.replace(/\*/g, '* ')
				.replace(/\(/g, '（')
				.replace(/\)/g, '）');

		// Fetching ended, now start structure fill

		var $fa = $('<div id="form-stuinfo"><div class="control-group"><label class="control-label" for="xuehao">学号</label><div class="controls"><input type="number" id="xuehao" name="xuehao" placeholder="五位数班学号" required="required" min="10101" max="32100" /></div></div>'
			 + '<div class="control-group"><label class="control-label" for="inputPassword">密码</label><div class="controls"><input type="text" id="password" name="password" placeholder="身份证号码等" required="required" /></div></div></div>');
		$fa.after('<div class="control-group" id="exam-control"><label class="control-label" for="kaoshi">考试</label><div class="controls"><span class="help-block">请先输入学号</span></div></div>');
		$fa.after('<div class="control-group"><div class="controls"><input type="submit" class="btn btn-primary" value="查询" /></div></div>');

		$f.addClass('form-horizontal').html('').append($fa);

		var $container = $('<div id="container" class="container" />').appendTo($('<body />').replaceAll('body'));

		var $append = $('<h1>金中成绩查询</h1>')
			.after($f)
			.after('<h2>教务处通知</h2><div id="orig-announcement"></div>');

		$container.append($append);

		// Structure fill ended, now content fill

		$('#orig-announcement').append('<div class="alert alert-info">'+update_status_t+'</div><p>'+orig_announcement_t.replace(/(\n|\r)/g,'</p><p>')+'</p>');

		// 全角转半角函数来自 http://www.jslab.org.cn
		function dbc2sbc(t){
			return (t || '').replace(/[\uff01-\uff5e]/g, function(a){return String.fromCharCode(a.charCodeAt(0)-65248);}).replace(/\u3000/g," ");
		}

		function get_current_exam(){
			var arr = update_status_t.split('（')[0].split('');
			console.log(arr);
		}
		//get_current_exam();

		$('#password').change(function(){
			$(this).val(function(i, v){return $.trim(String(dbc2sbc(v)).replace('X', 'x'))});
		});

		$('#xuehao').change(function(){
			var no = $(this).val();
			$kaoshi_new.detach();
			var vf = false;
			if(no.indexOf('1') == 0){
				$kaoshi_new.each(function(){
					var $this = $(this);
					if(this.innerText.indexOf('高一') == -1){
						$this.addClass('hide');
					}else{
						$this.removeClass('hide');
						if(!vf) vf = $this.find('input')[0];
					}
				});
				if(vf) vf.checked = true;
			}
			if(no.indexOf('2') == 0){
				$kaoshi_new.each(function(){
					var $this = $(this);
					if(this.innerText.indexOf('高二') == -1){
						$this.addClass('hide');
					}else{
						$this.removeClass('hide');
						if(!vf) vf = $this.find('input')[0];
					}
				});
				if(vf) vf.checked = true;
			}
			if(no.indexOf('3') == 0){
				$kaoshi_new.each(function(){
					var $this = $(this);
					if(this.innerText.indexOf('高三') == -1 && this.innerText.indexOf('高考') == -1){
						$(this).addClass('hide');
					}else{
						$(this).removeClass('hide');
						if(!vf) vf = $this.find('input')[0];
					}
				});
				//var $vf = $kaoshi_new.not('.hide').find('input')[0];
				if(vf) vf.checked = true;
			}
			if(vf){
				$('#exam-control .controls').empty().addClass('collapsed').append($kaoshi_new).append($exams_act);
			}else{
				$('#exam-control .controls').html('<span class="help-block">请先输入学号</span>');
			}
		});
		
		var $exams_act = $('<p><a id="expand_all" href="javascript:void(0)" class="btn btn-mini"><i class="icon-chevron-down" /> 显示更多</a><a id="collapse_all" href="javascript:void(0)" style="display:none" class="btn btn-mini"><i class="icon-chevron-up" /> 隐藏考试</a></p>');

		$('#expand_all', $exams_act).click(function(){
			$kaoshi_new.filter('.hide').show();
			$(this).hide().parent().parent().removeClass('collapsed').addClass('expanded');
			$('#collapse_all').show();
			$kaoshi_new.find('input').filter(':checked').focus();
		});
		$('#collapse_all', $exams_act).click(function(){
			$kaoshi_new.filter('.hide').hide();
			$(this).hide().parent().parent().removeClass('expanded').addClass('collapsed');
			$('#expand_all').show();
			$kaoshi_new.find('input').filter(':checked').focus();
		});

		// Ajax and info saving
		$f.submit(function(){
			$('body').fadeTo(50, 0.25);
			if(localStorage){
				localStorage['stu_arr_0'] = $('#xuehao').val()+';'+$('#password').val();
			}
			window.history.replaceState($f.serialize(), document.title, location.href);
		});

		// Info read
		if(localStorage && localStorage['stu_arr_0']){
			var stu_arr = [(localStorage['stu_arr_0'] || '').split(';')];
			$('#xuehao').val(stu_arr[0][0]).change();
			$('#password').val(stu_arr[0][1]);
		}

		// Finally show the page
		$('body').addClass('loaded');
	});
}