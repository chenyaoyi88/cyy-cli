var oBtnSubmit = document.getElementById('submit');
var oModal = document.getElementById('modal');
var oPhone = document.getElementById('phone');

oBtnSubmit.addEventListener('click', function () {
    if (!/\S/.test(oPhone.value)) {
        toast('请输入您的电话号码');
    }
});

ajax({
    url: API + '/test_get',
    type: 'get',
    data: {
        name: 'cyy',
        age: 18
    },
    header: {
        token: '123123'
    }
})
.then((data) => {
    console.log(data);
})
.catch((err) => {
    console.warn(err);
});