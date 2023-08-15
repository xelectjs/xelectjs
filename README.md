<p align="center">
  <img src="/assets/Xelect.png" alt="Xelectjs full logo" style="height: 250px;"/>
</p>
<p align="center">
  A selective, reactive and progressive framework for creating user interfaces for the web. Your apps could be faster: the web can be better
</p>

## Why the need for Xelect
Xelectjs stands apart from other web frameworks and libraries by functioning as more than just a typical web development tool. It serves as a developer's
friend, aiming to enhance and expand current web technologies progressively. This innovative framework introduces an impressive set of strategies and 
functionalities, offering developers the means to build fast applications with greater ease and efficiency.     
It tries to solve some common issues with some known frameworks and libraries that negatively affect the performance of web applications. The project does not
seek to convince you into beleiving every framework or library out there isn't good for the work. We hope it energize and increase your thirst for faster applications
on the web. You may join us in the quest for a better web.    

 ## What are the problems Xelect is solving now
 Web development encompasses a multitude of challenges, ranging from slow application performance to development complexities, insufficiency in documentation
 for web technologies, and the steep learning curves associated with various frameworks and libraries. Xelect endeavors to address a substantial portion of
 these issues and more. It is particularly attuned to alleviating challenges prevalent in current web development, which includes a strong emphasis on resolving 
 React-like frameworks related concerns. Xelect's inception was driven by the author's quest to explore the ways in which the React framework's speed could be enhanced, 
 leading to its focused approach in tackling these problems head-on.     

 Let's review some of the problems.    

 The basic React code below indicates several serious issues with some frameworks and libraries that could be the reason for slow applications.    

 ```js
import  React, {useState} from 'react';

// This component would perform some heavy task when rendering
function HeavilyTaskedComponent(){
  console.log('I just performed a heavy task')
  return (
  <div>I just logged to the console</div>
  )
}

export function App() {
  const [count,setCount] = useState(0);
  console.log("I'm logged whenever button is clicked: "+count+" times.")
  const onButtonClicked = ()=>{setCount(count+1)}
  return (
    <div className="App">
      <h2>Unnecessary task execution example</h2>
      <button onClick={onButtonClicked}>Clicked: {count}</button>
      <HeavilyTaskedComponent/>
    </div>
  );
}

```
In the provided React code snippet, when the button is clicked, the state variable `count` is updated, prompting a re-render of the `App` component. However, during this re-rendering process, an entirely new object representing the component's UI is created. This new object is compared with the previously generated object to identify the specific DOM nodes that require updates. This mechanism is referred to as the "virtual D OM" and "reconciliation" in React. This cycle of re-rendering and updating happens each time the button is clicked.    

One significant issue that arises from this process is unnecessary task execution. This is particularly evident in cases where the `HeavilyTaskedComponent` is executed every time the button is clicked. The question then arises: why should this be the case? Why is it that we are only updating the `count` variable which has nothing to do with the `HeavilyTaskedComponent`, our heavily tasked component must be re-executed. Why the need for a full re-exection of the `App` component if the state changes only affect a small portion of the component? [Try code snippet](https://playcode.io/1562868)

Indeed, React and other frameworks or libraries are often considered fast due to their innovative approaches to mitigating certain performance bottlenecks, 
particularly those related to excessive and inefficient updates to the DOM. However,  it's worth acknowledging that while these frameworks address specific 
performance challenges, they overlook issues such as unnecessary task executions and not fully optimize other aspects of the development process.

Xelect emerged from a determination to delve into the intricacies of improving React's speed and performance. Xelect takes a unique approach to rectifying these 
concerns and providing more streamlined and efficient solutions. The idea is that if current frameworks, despite their challenges, are already perceived as fast, 
a framework like Xelect that prioritizes tackling these issues directly could potentially offer even better performance and address some of the neglected aspects.    

  



