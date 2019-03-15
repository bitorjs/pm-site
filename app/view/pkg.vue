<template>
    <div class="container">
        <h1 class="title">{{title}}</h1>
        <p class="desc">{{desc}}</p>
        <p class="tab">
					<span class="readme">Readme</span>
					<span class="dependencies">Dependencies</span>
					<span class="dependents">Dependents</span>
					<span class="versions">Versions</span>
        </p>
				<div class="pkg">
					<div class="left-container">
						asdf
					</div>
					<div class="right-container">
						asdf
					</div>
				</div>
    </div>
</template>
<script>
export default {
    name: '',
    data(){
        return {
            title: 'koa',
            desc: '2.7.0 • Public • Published a month ago'
        }
    }
}
</script>
<style lang="less" scoped>
.container{
	.title, .desc {
		padding: 1rem;
	}

	.tab {
		cursor: pointer;
		span{
			text-align: center;
			padding: 12px 2rem;
			font-size: 15px;
			font-weight: 600;
			background: white;
			border-radius: 5px 5px 0 0;
			float: left;
			width: 25%;
			display: inline-block;
			&.readme{
				color: rgb(158, 119, 0);
				border-bottom: 2px solid #FFCD3A;
				&:active, &:focus, &:hover, &:link, &:visited{
					background-color: rgba(255, 205, 58, 0.2);
				}
			}
			&.dependencies{
				color: #cb3837;
				border-bottom: 2px solid #cb3837;
				&:active, &:focus, &:hover, &:link, &:visited{
					background-color: rgba(203, 56, 55, 0.2);
				}
			}
			&.dependents{
				color: rgb(120, 33, 117);
				border-bottom: 2px solid #C836C3;
				&:active, &:focus, &:hover, &:link, &:visited{
					background-color: rgba(200, 54, 195, 0.2);
				}
			}
			&.versions{
				color: rgb(41, 0, 138);
				border-bottom: 2px solid #8956FF;
				&:active, &:focus, &:hover, &:link, &:visited{
					background-color: rgba(137, 86, 255, 0.2);
				}
			}
		}
	}

	.pkg{
		margin-top: 1rem;
		
		.left-container{
			width: calc(100% - 200px);
			float: left;
			background: white;
		}
		.right-container{
			width: 200px;
			float: right;
			background: white;
		}
	}
}

@media only screen and (max-width: 767px) { 
	.container{
		max-width: 100%!important;
	}
	.tab {
		span{
			width: 100%!important;
		}
	}
}
</style>
