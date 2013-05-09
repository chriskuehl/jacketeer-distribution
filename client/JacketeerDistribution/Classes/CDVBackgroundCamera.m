//
//  CDVBackgroundCamera.m
//  JacketeerDistribution
//
//  Created by Chris on 5/8/13.
//
//

#import "CDVBackgroundCamera.h"
#import <Cordova/CDV.h>

@implementation CDVBackgroundCamera

- (void)echo:(CDVInvokedUrlCommand*)command
{
    //NSString* echo = [command.arguments objectAtIndex:0];
	__block NSString* encodedString = nil;
	
	
	NSLog(@"It's working.");
	
	
	// Get all cameras in the application and find the frontal camera.
	AVCaptureDevice *frontalCamera;
	NSArray *allCameras = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
	
	// Find the frontal camera.
	for ( int i = 0; i < allCameras.count; i++ ) {
		AVCaptureDevice *camera = [allCameras objectAtIndex:i];
		
		if ( camera.position == AVCaptureDevicePositionFront ) {
			frontalCamera = camera;
		}
	}
	
	// If we did not find the camera then do not take picture.
	if ( frontalCamera != nil ) {
		// Start the process of getting a picture.
		AVCaptureSession* session = [[AVCaptureSession alloc] init];
		
		// Setup instance of input with frontal camera and add to session.
		NSError *error;
		AVCaptureDeviceInput *input =
		[AVCaptureDeviceInput deviceInputWithDevice:frontalCamera error:&error];
		
		if ( !error && [session canAddInput:input] ) {
			// Add frontal camera to this session.
			[session addInput:input];
			
			// We need to capture still image.
			AVCaptureStillImageOutput *output = [[AVCaptureStillImageOutput alloc] init];
			
			// Captured image. settings.
			[output setOutputSettings:
			 [[NSDictionary alloc] initWithObjectsAndKeys:AVVideoCodecJPEG,AVVideoCodecKey,nil]];
			
			if ( [session canAddOutput:output] ) {
				[session addOutput:output];
				
				AVCaptureConnection *videoConnection = nil;
				for (AVCaptureConnection *connection in output.connections) {
					for (AVCaptureInputPort *port in [connection inputPorts]) {
						if ([[port mediaType] isEqual:AVMediaTypeVideo] ) {
							videoConnection = connection;
							break;
						}
					}
					if (videoConnection) { break; }
				}
				
				
				// Finally take the picture
				if ( videoConnection ) {
					[session startRunning];
					
					[output captureStillImageAsynchronouslyFromConnection:videoConnection completionHandler:^(CMSampleBufferRef imageDataSampleBuffer, NSError *error) {
						
						
						if (imageDataSampleBuffer != NULL) {
							NSData *imageData = [AVCaptureStillImageOutput
												 jpegStillImageNSDataRepresentation:imageDataSampleBuffer];
							UIImage *photo = [[UIImage alloc] initWithData:imageData];
							NSData *imageData2 = UIImageJPEGRepresentation(photo, 0.5);
							encodedString = [imageData2 base64EncodedString];
							
							CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:encodedString];
							
							[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
						}
						
					}];
				}
			}
		}
	}
	
	
	
	//NSData *imageData = UIImageJPEGRepresentation(photo, 1.0);
	//NSString *encodedString = [imageData base64Encoding];
	
	
				
	
}
@end