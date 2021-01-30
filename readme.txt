https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia

to run in docker:
cd C:\temp\dapplication directory

Must change localhost to unix host name nielexpt.com.
>docker build -t dass/docker-webrtc .
>docker run -d -p1111:111 dass/docker-webrtc
>docker logs zealous_franklin --follow