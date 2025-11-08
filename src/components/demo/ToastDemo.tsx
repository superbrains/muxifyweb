"use client"

import { Button, HStack } from "@chakra-ui/react"
import { toaster } from "@/components/ui/toaster-instance"

const ToastDemo = () => {
    return (
        <HStack gap={4} p={4}>
            <Button
                size="sm"
                variant="outline"
                onClick={() =>
                    toaster.create({
                        title: "Toast status is success",
                        description: "This is a success toast message",
                        type: "success",
                    })
                }
            >
                Success
            </Button>

            <Button
                size="sm"
                variant="outline"
                onClick={() =>
                    toaster.create({
                        title: "Toast status is error",
                        description: "This is an error toast message",
                        type: "error",
                    })
                }
            >
                Error
            </Button>

            <Button
                size="sm"
                variant="outline"
                onClick={() =>
                    toaster.create({
                        title: "Toast status is warning",
                        description: "This is a warning toast message",
                        type: "warning",
                    })
                }
            >
                Warning
            </Button>

            <Button
                size="sm"
                variant="outline"
                onClick={() =>
                    toaster.create({
                        title: "Toast status is info",
                        description: "This is an info toast message",
                        type: "info",
                    })
                }
            >
                Info
            </Button>

            <Button
                size="sm"
                variant="outline"
                onClick={() => {
                    const loadingToast = toaster.create({
                        title: "Loading...",
                        description: "This is a loading toast",
                        type: "loading",
                    });

                    // Simulate completion after 3 seconds
                    setTimeout(() => {
                        toaster.dismiss(loadingToast);
                        toaster.create({
                            title: "Loading complete!",
                            description: "The operation has finished successfully",
                            type: "success",
                        });
                    }, 3000);
                }}
            >
                Loading
            </Button>
        </HStack>
    )
}

export default ToastDemo
