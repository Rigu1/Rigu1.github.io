---
title: Spring Security에 기여하기
date: 2026-01-21 14:45:00 +0900
categories: [contributions]
tags: [spring-security]
---

## 이슈 선정하기

첫 기여인 만큼 이슈를 선정하는데 많은 시간이 걸렸다.  
오픈소스 프로젝트마다, 프로젝트의 각 레포마다 컨벤션이 다르고 메인테이너가 일을 진행하는 방식 또한 다르다.

기여하고 싶은 오픈소스를 찾아본 중 .NET 등 여러 오픈소스를 접했는데 코파일럿 중점으로 PR을 진행하는 경우도 있었고 같은 프로젝트라 하더라도 커밋 및 이슈, PR 템플릿이 다른 경우도 있었다.

그렇게 거의 일주일간 이슈를 찾아 돌아다니던 중 `spring-security`의 이슈를 선정했다.

{% include github-card.html url="https://github.com/spring-projects/spring-security/issues/18443" %}


## PR 오픈하기

### 이슈 살펴보기

위 이슈를 살펴보게되면 빌드 과정에서 모든 javadoc 경고를 제거한다는 내용이다. 

본문에 첫 작업자의 경우 javadoc 경고가 발생되면 빌드가 실패하도록 오류를 발생시키는 플러그인을 만들어달라는 추가 요청이 있었고 나는 이 이슈의 첫 하위 이슈를 담당하게 되어 플러그인 추가까지 작업하게 되었다.

{% include github-card.html url="https://github.com/spring-projects/spring-security/issues/18468" %}

위 이슈는 내가 선택한 하위 이슈다. 현재는 PR이 머지되어 Close상태다.  
상위 이슈의 안내대로 확인한 결과 web 모듈에서 javadoc 에러가 7개 검출되었고 내가 이 작업을 맡겠다고 언급한 뒤 작업을 시작했다. 

> 보통 작업은 이슈를 제기한 사람이 진행하거나 이슈를 맡겠다고 말하고 허락을 맡고 진행하지만 해당 이슈는 메인테이너가 제기했고 상위 이슈에서 해당 이슈의 첫 요청자라면 바로 작업을 진행해도 된다는 언급이 있어 바로 작업을 진행했다. 
{: .prompt-tip }


### javadoc 경고

작업을 위해서는 javadoc 경고가 무엇이고 왜 발생했는지부터 알아야할 필요가 있다.

Javadoc이란 자바 코드 내의 주석을 HTML 형태의 API 명세서로 만들어주는 도구다.  
이 문서를 만드는 과정에 구조적인 문제가 있을 경우 javadoc 경고가 나타나게 된다.

즉, 내가 수정하는 부분은 주석 부분이다.  
대략적인 부분을 파악하고 경고 발생 로그를 토대로 수정할 부분을 특정하여 수정을 진행했다.

### 잘못된 참조들

![Javadoc 빌드 경고 화면](/assets/img/2026-01-21-spring-security-contrib/javadoc-warning.png)

#### 모듈 외부 참조 오류
`/access/DelegaringMissingAuthorityAccessDeniedHandler.java`의 81번째 줄에 문제가 되는 부분이 있는 것으로 보인다.

`@see`로 연결되어 있는 파일이 web 모듈의 빌드 환경의 외부에 존재하여 제대로된 참조가 이뤄지지 않고 있었다.  
참고 자료로써는 필요하다고 판단하여 해당 레포의 관례를 따라 `<code>`태그 안에 넣어서 텍스트로 출력되도록 수정했다.

`/server/authentication/SwitchUserWebFilter.java`의 83번째 줄에도 문제가 있다.

`@link`가 가리키는 파일이 첫 문제와 같이 web 모듈의 빌드 환경의 외부에 존재하여 제대로된 참조가 이뤄지지 않고 있었다.  
똑같이 참고 자료로써는 필요하다고 판단하여 해당 레포의 관례를 따라 `<code>`태그 안에 넣어서 텍스트로 출력되도록 수정했다.

#### 오타로 인한 참조 오류
`/authentication/session/SessionAuthenticationException.java`의 25번쨰 줄에 문제가 있어보인다.

`@link`가 `ServerSessionAuthenticationStrategy` 파일을 가리키지만 해당 파일이 존재하질 않는다... 존재하는 파일 이름은 `SessionAuthenticationStrategy`이고 오타라고 판단하여 간단히 수정했다.

### 빌드 플러그인 추가

요청 사항에 따라 javadoc 경고 발생 시 오류를 발생시키는 스크립트를 작성해야한다.

기존에 있던 플러그인들의 스타일을 참고하여 작성했다. 

```gradle
import org.gradle.api.tasks.javadoc.Javadoc

project.tasks.withType(Javadoc).configureEach {
	options.addBooleanOption('Xdoclint:all', true)
	options.addBooleanOption('Werror', true)
}
```

#### 메인테이너와의 소통

처음에 플러그인을 작성할 떄 자바 환경인지 체크한 뒤 동작하도록 작성했었는데 코틀린 환경을 고려하지 않았었다...

관련해서 메인테이너분이 캐치하여 리뷰를 달아주셨고 수정하여 기존 커밋에 포스시켰다.
위 코드는 수정된 코드다. 원본을 확인하고 싶다면 PR에서 닫혀있는 Outdated를 열어서 확인하면 된다.

## 후기

메인테이너분이 새벽에 활동하셔서 PR을 날리고 답변을 받기까지 이틀간 새벽에 수시로 확인했다.  
그렇게 새벽에 온 알람에 부랴부랴 코드를 수정해서 커밋했고 머지되기까지 꼬박 밤을 새우며 지켜봤다.  
스프링 시큐리티 레포에 기여자로 분류되어 있는 것을 보니 뿌듯했다. 내 깃허브 프로필에도 넣어뒀다!

최근에 이렇게 몰입했던 경험을 해본 적이 있나? 다시 생각해보게 되었다.  
요즘 CS, 알고리즘 공부에 매너리즘을 느껴던 중 신선한 충격이었다.

앞으로도 종종 이슈를 찾아보며 시간이 되면 계속 오픈스스에 기여해보려고 한다.
