import torch, json
assert torch.cuda.is_available(), 'CUDA is unavailable'
x=torch.ones((64,64),device='cuda',dtype=torch.bfloat16)
y=x@x
torch.cuda.synchronize()
print(json.dumps({'torch':torch.__version__,'cuda':torch.version.cuda,'gpu':torch.cuda.get_device_name(0),'vram':torch.cuda.get_device_properties(0).total_memory,'bfloat16_matmul':float(y[0,0])}))
