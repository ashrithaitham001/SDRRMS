@echo off
set "DIR=%~dp0"
"%DIR%..\build-tools\apache-maven-3.9.6\bin\mvn.cmd" %*
