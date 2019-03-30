# pm-site

[npm-参考手册](https://segmentfault.com/a/1190000009315989)
ls/list
npm ls [[<@scope>/]<pkg> ...]
打印依赖树

--json: 已json格式输出

--long: 展示更多信息

--parseable: 显示展平的目录而不是依赖树

--global: 显示全局安装的包的依赖树

--depth: 树层级,从0开始

--prod/production: 仅显示package.json里dependencies包的依赖

--dev: 仅显示package.json里devDependencies包的依赖


bin
npm bin # 打印包含npm bin目录, 通常为node_modules/.bin/
npm prefix -g # 打印全局npm bin目录

npm doctor
环境检测

npm能调用node和git命令

registry能够访问

本地和全局node_modules可写

缓存存在且tarball文件健全

执行 cnpm adduser/login （ 第一次登录其实就是注册）
登出 npm logout [--registry=<url>] [--scope=<@scope>]
登录完成后可以通过 执行 cnpm who am i 来查看当前登录用户

发布模块：npm publish
取消模块：npm unpublish
废弃模块：npm deprecate [@] 
取消废弃模块：npm deprecate [@] ‘’，取消作废操作，就是为message 参数指定一个空字符串（""）

SyncModuleWorker


查看当前的tag和对应的version: npm dist-tag ls

重新设置为稳定版本: npm dist-tag add n-n-n-n@1.0.2-1 latest

查看当前包信息 npm info

查看仓储信息: npm view [<@scope>/]<name>[@<version>] [<field>[.<subfield>]...]
1. 查看my-package发布过的所有版本号
2. 查看依赖: npm view name@version dependencies

给my-package设置tag，对应到版本version: npm dist-tag add my-package@version tag

权限
npm允许通过scope组织私有包，通过team细化权限控制.

npm官方仓储有两种类型的包，普通包和scope包

普通包特征:

只能公有，谁都可以下载使用

仅可以通过所有者(owner)进行权限控制，如果要允许某个用户修改或发布包，必须将该用户添加到包的所有者列表。添加到包所有者列表的用户具备所有的权限.

scope包特征:

包名有两部组成，@scope/name, @后的为scope名,/后的才是具体的包名

可以控制公有和私有

细化的权限控制，比如可以创建团队,并赋予团队对包只读/修改的权限

owner
npm owner add <user> [<@scope>/]<pkg> # 将用户添加到包的所有者列表
npm owner rm <user> [<@scope>/]<pkg> # 从包的所有这列表中删除用户
npm owner ls [<@scope>/]<pkg> # 列出包的所有者
成为包的所有者的用户，将能够修改元数据(如标记弃用)，发布新版本,添加其他用户到包的所有者列表

t/team
npm team create <scope:team> # 创建团队
npm team destroy <scope:team> # 删除团队

npm team add <scope:team> <user> # 添加用户到团队
npm team rm <scope:team> <user> # 从团队中移除用户 

npm team ls <scope>|<scope:team> 列出团队/成员

npm team edit <scope:team>  用编辑器编辑团队信息
access
npm access public [<package>]  # 设置包开放
npm access restricted [<package>] # 设置包私有

npm access grant <read-only|read-write> <scope:team> [<package>] # 设置团队对包可以只读/允许修改
npm access revoke <scope:team> [<package>] # 从团队中收回包权限

npm access ls-packages [<user>|<scope>|<scope:team>]  # 列出用户/域/团队能够访问的包
npm access ls-collaborators [<package> [<user>]] # 列出包的权限信息
npm access edit [<package>] # 用编辑器编辑包权限
