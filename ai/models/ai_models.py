"""
AI Model definitions for geospatial analysis
Includes: Object Detection, Segmentation, Change Detection models
"""

import torch
import torch.nn as nn
import torchvision.models as models
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.models.segmentation import deeplabv3_resnet50
import segmentation_models_pytorch as smp
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GeospatialObjectDetector:
    """
    Object detection model for satellite/aerial imagery
    Detects: buildings, vehicles, roads, water bodies
    """
    
    def __init__(self, num_classes: int = 91, device: str = 'cpu'):
        self.device = device
        self.num_classes = num_classes
        self.model = self._load_model()
        
    def _load_model(self):
        """Load Faster R-CNN model"""
        logger.info("Loading Faster R-CNN model")
        model = fasterrcnn_resnet50_fpn(pretrained=True)
        model.to(self.device)
        model.eval()
        return model
    
    def predict(self, image: torch.Tensor, threshold: float = 0.5):
        """
        Predict objects in image
        
        Args:
            image: Tensor of shape (C, H, W)
            threshold: Confidence threshold
            
        Returns:
            List of detections with boxes, labels, and scores
        """
        with torch.no_grad():
            predictions = self.model([image.to(self.device)])
        
        # Filter predictions by threshold
        pred = predictions[0]
        keep = pred['scores'] > threshold
        
        return {
            'boxes': pred['boxes'][keep].cpu().numpy(),
            'labels': pred['labels'][keep].cpu().numpy(),
            'scores': pred['scores'][keep].cpu().numpy()
        }


class LandCoverSegmentation:
    """
    Semantic segmentation for land cover classification
    Classes: water, vegetation, urban, bare soil, clouds
    """
    
    def __init__(
        self,
        architecture: str = 'unet',
        encoder: str = 'resnet50',
        num_classes: int = 5,
        device: str = 'cpu'
    ):
        self.device = device
        self.num_classes = num_classes
        self.architecture = architecture
        self.encoder = encoder
        self.model = self._load_model()
    
    def _load_model(self):
        """Load segmentation model"""
        logger.info(f"Loading {self.architecture} with {self.encoder} encoder")
        
        if self.architecture == 'unet':
            model = smp.Unet(
                encoder_name=self.encoder,
                encoder_weights='imagenet',
                classes=self.num_classes,
                activation=None
            )
        elif self.architecture == 'deeplabv3':
            model = deeplabv3_resnet50(pretrained=True)
            # Modify final layer for custom classes
            model.classifier[4] = nn.Conv2d(256, self.num_classes, 1)
        else:
            raise ValueError(f"Unknown architecture: {self.architecture}")
        
        model.to(self.device)
        model.eval()
        return model
    
    def predict(self, image: torch.Tensor):
        """
        Predict land cover classes
        
        Args:
            image: Tensor of shape (C, H, W)
            
        Returns:
            Segmentation mask of shape (H, W)
        """
        with torch.no_grad():
            logits = self.model(image.unsqueeze(0).to(self.device))
            
            if isinstance(logits, dict):
                logits = logits['out']
            
            pred = torch.argmax(logits, dim=1).squeeze(0)
        
        return pred.cpu().numpy()


class ChangeDetectionModel:
    """
    Siamese network for change detection between temporal images
    """
    
    def __init__(self, device: str = 'cpu'):
        self.device = device
        self.model = self._build_model()
    
    def _build_model(self):
        """Build Siamese network for change detection"""
        logger.info("Building change detection model")
        
        class SiameseNet(nn.Module):
            def __init__(self):
                super(SiameseNet, self).__init__()
                
                # Feature extractor (shared weights)
                self.encoder = models.resnet18(pretrained=True)
                self.encoder.fc = nn.Identity()  # Remove final FC layer
                
                # Change detector
                self.decoder = nn.Sequential(
                    nn.Conv2d(512, 256, 3, padding=1),
                    nn.BatchNorm2d(256),
                    nn.ReLU(inplace=True),
                    nn.Conv2d(256, 128, 3, padding=1),
                    nn.BatchNorm2d(128),
                    nn.ReLU(inplace=True),
                    nn.Conv2d(128, 1, 1),
                    nn.Sigmoid()
                )
            
            def forward(self, x1, x2):
                # Extract features
                f1 = self.encoder(x1)
                f2 = self.encoder(x2)
                
                # Compute difference
                diff = torch.abs(f1 - f2)
                
                # Reshape for decoder
                diff = diff.view(diff.size(0), -1, 1, 1)
                diff = diff.expand(-1, -1, 8, 8)  # Adjust size as needed
                
                # Predict change mask
                change_mask = self.decoder(diff)
                
                return change_mask
        
        model = SiameseNet()
        model.to(self.device)
        model.eval()
        return model
    
    def predict(self, image1: torch.Tensor, image2: torch.Tensor):
        """
        Detect changes between two images
        
        Args:
            image1: First image (C, H, W)
            image2: Second image (C, H, W)
            
        Returns:
            Change mask
        """
        with torch.no_grad():
            change_mask = self.model(
                image1.unsqueeze(0).to(self.device),
                image2.unsqueeze(0).to(self.device)
            )
        
        return change_mask.squeeze().cpu().numpy()


class TimeSeriesPredictor:
    """
    Time series prediction for geospatial data
    Use cases: vegetation index forecasting, urban growth prediction
    """
    
    def __init__(self, input_size: int = 10, hidden_size: int = 64, num_layers: int = 2, device: str = 'cpu'):
        self.device = device
        self.model = self._build_model(input_size, hidden_size, num_layers)
    
    def _build_model(self, input_size, hidden_size, num_layers):
        """Build LSTM model for time series prediction"""
        logger.info("Building LSTM time series model")
        
        class LSTMPredictor(nn.Module):
            def __init__(self, input_size, hidden_size, num_layers):
                super(LSTMPredictor, self).__init__()
                
                self.lstm = nn.LSTM(
                    input_size=input_size,
                    hidden_size=hidden_size,
                    num_layers=num_layers,
                    batch_first=True,
                    dropout=0.2
                )
                
                self.fc = nn.Linear(hidden_size, 1)
            
            def forward(self, x):
                lstm_out, _ = self.lstm(x)
                predictions = self.fc(lstm_out[:, -1, :])
                return predictions
        
        model = LSTMPredictor(input_size, hidden_size, num_layers)
        model.to(self.device)
        model.eval()
        return model
    
    def predict(self, sequence: torch.Tensor):
        """
        Predict next value in time series
        
        Args:
            sequence: Tensor of shape (seq_len, input_size)
            
        Returns:
            Predicted value
        """
        with torch.no_grad():
            pred = self.model(sequence.unsqueeze(0).to(self.device))
        
        return pred.item()


class FeatureExtractor:
    """
    Extract features from satellite imagery for various downstream tasks
    """
    
    def __init__(self, model_name: str = 'resnet50', device: str = 'cpu'):
        self.device = device
        self.model = self._load_model(model_name)
    
    def _load_model(self, model_name: str):
        """Load pre-trained model"""
        logger.info(f"Loading feature extractor: {model_name}")
        
        if model_name == 'resnet50':
            model = models.resnet50(pretrained=True)
            model.fc = nn.Identity()  # Remove classification layer
        elif model_name == 'efficientnet':
            model = models.efficientnet_b0(pretrained=True)
            model.classifier = nn.Identity()
        else:
            raise ValueError(f"Unknown model: {model_name}")
        
        model.to(self.device)
        model.eval()
        return model
    
    def extract(self, image: torch.Tensor):
        """
        Extract features from image
        
        Args:
            image: Tensor of shape (C, H, W)
            
        Returns:
            Feature vector
        """
        with torch.no_grad():
            features = self.model(image.unsqueeze(0).to(self.device))
        
        return features.squeeze().cpu().numpy()


# Model factory
class ModelFactory:
    """Factory for creating AI models"""
    
    @staticmethod
    def create_model(model_type: str, **kwargs):
        """
        Create model instance
        
        Args:
            model_type: Type of model ('detector', 'segmentation', 'change_detection', 'timeseries')
            **kwargs: Model-specific arguments
            
        Returns:
            Model instance
        """
        if model_type == 'detector':
            return GeospatialObjectDetector(**kwargs)
        elif model_type == 'segmentation':
            return LandCoverSegmentation(**kwargs)
        elif model_type == 'change_detection':
            return ChangeDetectionModel(**kwargs)
        elif model_type == 'timeseries':
            return TimeSeriesPredictor(**kwargs)
        elif model_type == 'feature_extractor':
            return FeatureExtractor(**kwargs)
        else:
            raise ValueError(f"Unknown model type: {model_type}")


if __name__ == "__main__":
    # Example usage
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    logger.info(f"Using device: {device}")
    
    # Create models
    detector = ModelFactory.create_model('detector', device=device)
    segmentor = ModelFactory.create_model('segmentation', device=device)
    
    logger.info("Models loaded successfully")
