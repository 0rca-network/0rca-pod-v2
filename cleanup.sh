@echo off
echo Cleaning up deployments dynamically...

for /f "skip=1 tokens=1" %%i in ('kubectl get deployments -n default --no-headers') do (
    if not "%%i"=="custom-404-deploy" if not "%%i"=="buildkitd" if not "%%i"=="deploy-service" if not "%%i"=="ssl-test" (
        echo Deleting deployment %%i
        kubectl delete deployment %%i -n default
    )
)

echo Cleaning up services...
for /f "skip=1 tokens=1" %%i in ('kubectl get services -n default --no-headers') do (
    if not "%%i"=="custom-404-svc" if not "%%i"=="buildkitd" if not "%%i"=="deploy-service" if not "%%i"=="ssl-test" if not "%%i"=="kubernetes" (
        echo Deleting service %%i
        kubectl delete service %%i -n default
    )
)

echo Cleaning up ingresses...
for /f "skip=1 tokens=1" %%i in ('kubectl get ingress -n default --no-headers') do (
    if not "%%i"=="deploy-service-ingress" if not "%%i"=="ssl-test-ingress" if not "%%i"=="catchall-default-backend" if not "%%i"=="user123-ingress" (
        echo Deleting ingress %%i
        kubectl delete ingress %%i -n default
    )
)

echo Cleanup completed!
kubectl get deployments,services,ingress -n default